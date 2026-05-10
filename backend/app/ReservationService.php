<?php

declare(strict_types=1);

namespace Spaceh;

use DateTimeImmutable;
use Exception;
use PDO;

final class ReservationService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function create(array $user, array $body): array
    {
        $this->releaseExpiredCheckIns();

        $resourceId = self::numericId((string) ($body['resourceId'] ?? ''), 'SR');
        $start = self::timestamp((string) ($body['startTime'] ?? ''));
        $end = self::timestamp((string) ($body['endTime'] ?? ''));
        $coBookers = array_values(array_filter(array_map('trim', $body['coBookers'] ?? [])));

        if ($resourceId === null || $start === null || $end === null || $end <= $start) {
            return self::error('Choose a valid resource and time range.', 400);
        }

        $windowError = (new LibraryHoursService($this->pdo))->validateReservationWindow($start, $end);
        if ($windowError !== null) {
            return self::error($windowError, 422);
        }

        $this->pdo->beginTransaction();
        try {
            $dbUser = $this->dbUser((string) $user['universityId']);
            $resource = $this->resource($resourceId);
            if ($dbUser === null || $resource === null) {
                return $this->rollback(self::error('User or resource not found.', 404));
            }

            if ($dbUser['banned_until'] !== null && strtotime((string) $dbUser['banned_until']) > time()) {
                return $this->rollback(self::error('Account has an active booking hold.', 403));
            }

            if (self::isMaintenanceStatus((string) $resource['status'])) {
                return $this->rollback(self::error('That space is under maintenance.', 409));
            }

            if ((bool) $resource['faculty_exclusive'] && !in_array($dbUser['role'], ['FACULTY', 'ADMIN'], true)) {
                return $this->rollback(self::error('Faculty-exclusive rooms require faculty access.', 403));
            }

            if ($this->hasActiveReservation((int) $dbUser['id'])) {
                return $this->rollback(self::error('Only one active reservation is allowed at a time.', 409));
            }

            $hours = ($end->getTimestamp() - $start->getTimestamp()) / 3600;
            if ($resource['resource_type'] === 'INDIVIDUAL_SEAT' && $hours > 4) {
                return $this->rollback(self::error('Individual seats can only be booked for a maximum of 4 hours.', 422));
            }

            $participants = 1 + count($coBookers);
            $minimumParticipants = max(1, (int) $resource['min_participants']);
            if ($dbUser['role'] === 'STUDENT' && $participants < $minimumParticipants) {
                return $this->rollback(self::error("This room requires at least {$minimumParticipants} participants.", 422));
            }

            if ($this->hasResourceConflict($resourceId, $start, $end)) {
                return $this->rollback(self::error('This space is already booked during the selected time.', 409));
            }

            $insert = $this->pdo->prepare('insert into reservation (user_id, resource_id, start_time, end_time, status) values (?, ?, ?, ?, ?)');
            $insert->execute([
                $dbUser['id'],
                $resourceId,
                self::dbTime($start),
                self::dbTime($end),
                'PENDING',
            ]);
            $reservationId = (int) $this->pdo->lastInsertId();

            if ($coBookers !== []) {
                $participantInsert = $this->pdo->prepare('insert into reservation_participant (reservation_id, participant_university_id) values (?, ?)');
                foreach ($coBookers as $coBooker) {
                    $participantInsert->execute([$reservationId, $coBooker]);
                }
            }

            if ($resource['status'] === 'AVAILABLE') {
                $this->setResourceStatus($resourceId, 'RESERVED');
            }
            $this->pdo->commit();

            return ['status' => 201, 'body' => ['message' => 'Reservation created.', 'reservationId' => self::displayId($reservationId, 'RES')]];
        } catch (Exception $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    public function cancel(array $user, string $reservationDisplayId): array
    {
        $this->releaseExpiredCheckIns();

        $reservationId = self::numericId($reservationDisplayId, 'RES');
        if ($reservationId === null) {
            return self::error('Reservation not found.', 404);
        }

        $this->pdo->beginTransaction();
        try {
            $reservation = $this->reservationForAction($reservationId, $user);
            if ($reservation === null) {
                return $this->rollback(self::error('Reservation not found.', 404));
            }

            if (!in_array($reservation['status'], ['PENDING', 'ACTIVE', 'CONFIRMED'], true)) {
                return $this->rollback(self::error('Only active reservations can be cancelled.', 409));
            }

            $minutesUntilStart = (strtotime((string) $reservation['start_time']) - time()) / 60;
            if (($user['role'] ?? '') !== 'ADMIN' && $minutesUntilStart < 30) {
                return $this->rollback(self::error('Reservations can only be cancelled at least 30 minutes before the start time.', 422));
            }

            $this->updateReservationStatus($reservationId, 'CANCELLED');
            $this->releaseResource((int) $reservation['resource_id']);
            $this->pdo->commit();

            return ['status' => 200, 'body' => ['message' => 'Reservation cancelled.']];
        } catch (Exception $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    public function checkIn(array $user, string $reservationDisplayId): array
    {
        return $this->attendanceTransition($user, $reservationDisplayId, true);
    }

    public function checkOut(array $user, string $reservationDisplayId): array
    {
        return $this->attendanceTransition($user, $reservationDisplayId, false);
    }

    private function attendanceTransition(array $user, string $reservationDisplayId, bool $checkIn): array
    {
        $reservationId = self::numericId($reservationDisplayId, 'RES');
        if ($reservationId === null) {
            return self::error('Reservation not found.', 404);
        }

        $this->pdo->beginTransaction();
        try {
            $reservation = $this->reservationForAction($reservationId, $user);
            if ($reservation === null) {
                return $this->rollback(self::error('Reservation not found.', 404));
            }

            if ($checkIn) {
                if (!in_array($reservation['status'], ['PENDING', 'CONFIRMED'], true)) {
                    return $this->rollback(self::error('Only pending reservations can be checked in.', 409));
                }

                if (self::checkInGraceExpired((string) $reservation['start_time'], new DateTimeImmutable())) {
                    $this->updateReservationStatus($reservationId, 'NO_SHOW');
                    $this->releaseResource((int) $reservation['resource_id']);
                    $this->pdo->commit();

                    return self::error('Reservation expired after the 15-minute check-in grace period.', 409);
                }

                if (self::isMaintenanceStatus($this->resourceStatus((int) $reservation['resource_id']))) {
                    return $this->rollback(self::error('That space is under maintenance.', 409));
                }

                $insert = $this->pdo->prepare('insert into attendance_log (reservation_id, actual_check_in) values (?, ?) on duplicate key update actual_check_in = values(actual_check_in), actual_check_out = null');
                $insert->execute([$reservationId, self::dbTime(new DateTimeImmutable())]);
                $this->updateReservationStatus($reservationId, 'ACTIVE');
                $this->setResourceStatus((int) $reservation['resource_id'], 'OCCUPIED');
                $message = 'Checked in.';
            } else {
                if ($reservation['status'] !== 'ACTIVE') {
                    return $this->rollback(self::error('Only checked-in reservations can be checked out.', 409));
                }

                $update = $this->pdo->prepare('update attendance_log set actual_check_out = ? where reservation_id = ? and actual_check_out is null');
                $update->execute([self::dbTime(new DateTimeImmutable()), $reservationId]);
                $this->updateReservationStatus($reservationId, 'COMPLETED');
                $this->releaseResource((int) $reservation['resource_id']);
                $message = 'Checked out.';
            }

            $this->pdo->commit();
            return ['status' => 200, 'body' => ['message' => $message]];
        } catch (Exception $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    public function releaseExpiredCheckIns(): int
    {
        $ownsTransaction = !$this->pdo->inTransaction();
        if ($ownsTransaction) {
            $this->pdo->beginTransaction();
        }

        try {
            $statement = $this->pdo->prepare(
                "select id, resource_id
                 from reservation
                 where status in ('PENDING', 'CONFIRMED')
                   and start_time < date_sub(now(), interval 15 minute)
                 for update"
            );
            $statement->execute();
            $expired = $statement->fetchAll();

            if ($expired === []) {
                if ($ownsTransaction) {
                    $this->pdo->commit();
                }
                return 0;
            }

            $reservationIds = array_map(fn (array $row): int => (int) $row['id'], $expired);
            $resourceIds = array_values(array_unique(array_map(fn (array $row): int => (int) $row['resource_id'], $expired)));

            $this->updateMany('reservation', 'status', 'NO_SHOW', $reservationIds);
            $this->updateMany('study_resource', 'status', 'AVAILABLE', $resourceIds, " and status = 'RESERVED'");

            if ($ownsTransaction) {
                $this->pdo->commit();
            }

            return count($reservationIds);
        } catch (Exception $exception) {
            if ($ownsTransaction && $this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    private function dbUser(string $universityId): ?array
    {
        $statement = $this->pdo->prepare('select id, university_id, role, banned_until from app_user where university_id = ? limit 1 for update');
        $statement->execute([$universityId]);
        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    private function resource(int $id): ?array
    {
        $statement = $this->pdo->prepare('select id, resource_type, status, min_participants, faculty_exclusive from study_resource where id = ? limit 1 for update');
        $statement->execute([$id]);
        $resource = $statement->fetch();

        return $resource === false ? null : $resource;
    }

    private function hasActiveReservation(int $userId): bool
    {
        $statement = $this->pdo->prepare("select count(*) from reservation where user_id = ? and status in ('PENDING', 'ACTIVE', 'CONFIRMED') and end_time > now()");
        $statement->execute([$userId]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function hasResourceConflict(int $resourceId, DateTimeImmutable $start, DateTimeImmutable $end): bool
    {
        $statement = $this->pdo->prepare(
            "select count(*) from reservation
             where resource_id = ?
               and status in ('PENDING', 'ACTIVE', 'CONFIRMED')
               and start_time < ?
               and end_time > ?"
        );
        $statement->execute([$resourceId, self::dbTime($end), self::dbTime($start)]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function reservationForAction(int $reservationId, array $user): ?array
    {
        $sql = "select r.id, r.user_id, r.resource_id, r.start_time, r.end_time, r.status
                from reservation r
                join app_user u on u.id = r.user_id
                where r.id = ?";
        $params = [$reservationId];
        if (($user['role'] ?? '') !== 'ADMIN') {
            $sql .= ' and u.university_id = ?';
            $params[] = $user['universityId'];
        }
        $sql .= ' limit 1 for update';

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $reservation = $statement->fetch();

        return $reservation === false ? null : $reservation;
    }

    private function updateReservationStatus(int $reservationId, string $status): void
    {
        $statement = $this->pdo->prepare('update reservation set status = ? where id = ?');
        $statement->execute([$status, $reservationId]);
    }

    private function setResourceStatus(int $resourceId, string $status): void
    {
        $statement = $this->pdo->prepare('update study_resource set status = ? where id = ?');
        $statement->execute([$status, $resourceId]);
    }

    private function releaseResource(int $resourceId): void
    {
        $status = $this->resourceStatus($resourceId);
        if (self::isMaintenanceStatus($status)) {
            $this->setResourceStatus($resourceId, 'MAINTENANCE');
            return;
        }

        $this->setResourceStatus($resourceId, 'AVAILABLE');
    }

    private function resourceStatus(int $resourceId): string
    {
        $statement = $this->pdo->prepare('select status from study_resource where id = ? limit 1 for update');
        $statement->execute([$resourceId]);

        return (string) $statement->fetchColumn();
    }

    private static function isMaintenanceStatus(string $status): bool
    {
        return in_array($status, ['MAINTENANCE', 'MAINTENANCE_PENDING', 'UNDER_MAINTENANCE'], true);
    }

    private function updateMany(string $table, string $column, string $value, array $ids, string $extraWhere = ''): void
    {
        if ($ids === []) {
            return;
        }

        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $statement = $this->pdo->prepare("update {$table} set {$column} = ? where id in ({$placeholders}){$extraWhere}");
        $statement->execute([$value, ...$ids]);
    }

    private function rollback(array $result): array
    {
        $this->pdo->rollBack();
        return $result;
    }

    private static function error(string $message, int $status): array
    {
        return ['status' => $status, 'body' => ['message' => $message]];
    }

    private static function numericId(string $value, string $prefix): ?int
    {
        if (preg_match('/^' . preg_quote($prefix, '/') . '0*(\d+)$/', strtoupper($value), $matches)) {
            return (int) $matches[1];
        }

        return ctype_digit($value) ? (int) $value : null;
    }

    private static function displayId(int $id, string $prefix): string
    {
        return $prefix . str_pad((string) $id, 3, '0', STR_PAD_LEFT);
    }

    private static function timestamp(string $value): ?DateTimeImmutable
    {
        if ($value === '') {
            return null;
        }

        try {
            return new DateTimeImmutable($value);
        } catch (Exception) {
            return null;
        }
    }

    private static function dbTime(DateTimeImmutable $time): string
    {
        return $time->format('Y-m-d H:i:s');
    }

    private static function checkInGraceExpired(string $startTime, DateTimeImmutable $now): bool
    {
        $start = strtotime($startTime);
        if ($start === false) {
            return false;
        }

        return $now->getTimestamp() > $start + (15 * 60);
    }
}
