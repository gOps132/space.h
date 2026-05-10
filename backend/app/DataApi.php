<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class DataApi
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function resources(): array
    {
        $this->releaseExpiredCheckIns();

        $rows = $this->pdo
            ->query('select id, resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive from study_resource order by floor, id')
            ->fetchAll();

        return array_map(fn (array $row): array => [
            'resource_id' => 'SR' . str_pad((string) $row['id'], 3, '0', STR_PAD_LEFT),
            'resource_name' => $row['resource_name'],
            'resource_type' => $this->resourceType((string) $row['resource_type']),
            'zone_location' => $row['zone_location'],
            'floor' => (int) $row['floor'],
            'current_status' => $this->resourceStatus((string) $row['status']),
            'has_power_outlet' => (bool) $row['has_power_outlet'],
            'capacity' => $row['capacity'] === null ? null : (int) $row['capacity'],
            'min_participants' => (int) $row['min_participants'],
            'is_faculty_exclusive' => (bool) $row['faculty_exclusive'],
        ], $rows);
    }

    public function reservations(?array $user = null): array
    {
        $this->releaseExpiredCheckIns();

        $sql = 'select r.id, r.user_id, r.resource_id, r.start_time, r.end_time, r.status, r.created_at
                from reservation r
                join app_user u on u.id = r.user_id';
        $params = [];
        if ($user !== null && ($user['role'] ?? '') !== 'ADMIN') {
            $sql .= ' where u.university_id = ?';
            $params[] = $user['universityId'];
        }
        $sql .= ' order by r.start_time desc, r.id desc';

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $rows = $statement->fetchAll();
        $participants = $this->participantsByReservation();

        return array_map(fn (array $row): array => [
            'reservation_id' => 'RES' . str_pad((string) $row['id'], 3, '0', STR_PAD_LEFT),
            'user_id' => 'U' . str_pad((string) $row['user_id'], 3, '0', STR_PAD_LEFT),
            'resource_id' => 'SR' . str_pad((string) $row['resource_id'], 3, '0', STR_PAD_LEFT),
            'start_time' => $row['start_time'],
            'end_time' => $row['end_time'],
            'booking_status' => $this->reservationStatus((string) $row['status']),
            'created_at' => $row['created_at'],
            'co_bookers' => $participants[(int) $row['id']] ?? [],
        ], $rows);
    }

    public function attendanceLogs(?array $user = null): array
    {
        $this->releaseExpiredCheckIns();

        $sql = 'select a.id, a.reservation_id, a.actual_check_in, a.actual_check_out, a.session_notes
                from attendance_log a
                join reservation r on r.id = a.reservation_id
                join app_user u on u.id = r.user_id';
        $params = [];
        if ($user !== null && ($user['role'] ?? '') !== 'ADMIN') {
            $sql .= ' where u.university_id = ?';
            $params[] = $user['universityId'];
        }
        $sql .= ' order by a.id desc';

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $rows = $statement->fetchAll();

        return array_map(fn (array $row): array => [
            'log_id' => 'LOG' . str_pad((string) $row['id'], 3, '0', STR_PAD_LEFT),
            'reservation_id' => 'RES' . str_pad((string) $row['reservation_id'], 3, '0', STR_PAD_LEFT),
            'actual_check_in' => $row['actual_check_in'],
            'actual_check_out' => $row['actual_check_out'],
            'session_notes' => $row['session_notes'],
        ], $rows);
    }

    public function dashboard(): array
    {
        $resources = $this->resources();
        $reservations = $this->reservations(['role' => 'ADMIN']);
        $occupied = count(array_filter($resources, fn (array $resource): bool => in_array($resource['current_status'], ['Reserved', 'Occupied'], true)));
        $occupancyRate = count($resources) === 0 ? 0 : round(($occupied / count($resources)) * 100, 1);

        return [
            'dashboard_id' => 'DASH001',
            'total_active_users' => (int) $this->pdo->query("select count(*) from app_user where account_status = 'ACTIVE'")->fetchColumn(),
            'occupancy_rate' => $occupancyRate,
            'peak_time_data' => $this->peakData($reservations),
            'top_performing_zone' => $this->topZone($resources),
        ];
    }

    private function resourceType(string $value): string
    {
        return match ($value) {
            'INDIVIDUAL_SEAT' => 'Individual Seat',
            'CONSULTATION_ROOM' => 'Consultation Room',
            default => 'Group Study Room',
        };
    }

    private function resourceStatus(string $value): string
    {
        return match ($value) {
            'AVAILABLE' => 'Available',
            'RESERVED' => 'Reserved',
            'OCCUPIED' => 'Occupied',
            default => 'Under Maintenance',
        };
    }

    private function reservationStatus(string $value): string
    {
        return match ($value) {
            'PENDING' => 'Pending',
            'CONFIRMED' => 'Pending',
            'ACTIVE' => 'Active',
            'COMPLETED' => 'Completed',
            'CANCELLED' => 'Cancelled',
            'NO_SHOW' => 'No-show',
            default => 'Pending',
        };
    }

    private function releaseExpiredCheckIns(): void
    {
        (new ReservationService($this->pdo))->releaseExpiredCheckIns();
    }

    private function participantsByReservation(): array
    {
        $rows = $this->pdo
            ->query('select reservation_id, participant_university_id from reservation_participant order by id')
            ->fetchAll();

        $participants = [];
        foreach ($rows as $row) {
            $participants[(int) $row['reservation_id']][] = (string) $row['participant_university_id'];
        }

        return $participants;
    }

    private function peakData(array $reservations): array
    {
        $hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
        $counts = array_fill_keys($hours, 0);
        foreach ($reservations as $reservation) {
            $hour = date('g A', strtotime((string) $reservation['start_time']));
            if (array_key_exists($hour, $counts)) {
                $counts[$hour]++;
            }
        }

        return array_map(fn (string $hour): array => ['hour' => $hour, 'count' => $counts[$hour]], $hours);
    }

    private function topZone(array $resources): string
    {
        $zones = [];
        foreach ($resources as $resource) {
            $zone = (string) $resource['zone_location'];
            $zones[$zone] = ($zones[$zone] ?? 0) + 1;
        }
        arsort($zones);

        return array_key_first($zones) ?: 'No active zone';
    }
}
