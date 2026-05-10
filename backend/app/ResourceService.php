<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class ResourceService
{
    private const TYPES = [
        'Individual Seat' => 'INDIVIDUAL_SEAT',
        'Group Study Room' => 'GROUP_ROOM',
        'Consultation Room' => 'CONSULTATION_ROOM',
    ];

    private const STATUSES = [
        'Available' => 'AVAILABLE',
        'Reserved' => 'RESERVED',
        'Occupied' => 'OCCUPIED',
        'Under Maintenance' => 'MAINTENANCE',
    ];

    public function __construct(private readonly PDO $pdo)
    {
    }

    public function create(array $body): array
    {
        $name = trim((string) ($body['resourceName'] ?? ''));
        $type = self::TYPES[(string) ($body['resourceType'] ?? '')] ?? null;
        $zone = trim((string) ($body['zoneLocation'] ?? ''));
        $floor = (int) ($body['floor'] ?? 0);
        $capacity = isset($body['capacity']) && $body['capacity'] !== '' ? (int) $body['capacity'] : null;
        $minParticipants = self::minParticipants($body, $type);

        if ($name === '' || $type === null || $zone === '' || $floor < 1) {
            return self::error('Resource name, type, zone, and floor are required.', 400);
        }

        if ($minParticipants === null) {
            return self::error('Minimum participants must be a positive whole number.', 400);
        }

        $statement = $this->pdo->prepare(
            'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $name,
            $type,
            $zone,
            $floor,
            'AVAILABLE',
            !empty($body['hasPowerOutlet']) ? 1 : 0,
            $capacity,
            $minParticipants,
            !empty($body['isFacultyExclusive']) ? 1 : 0,
        ]);

        return [
            'status' => 201,
            'body' => [
                'message' => 'Resource created.',
                'resourceId' => 'SR' . str_pad((string) $this->pdo->lastInsertId(), 3, '0', STR_PAD_LEFT),
            ],
        ];
    }

    public function updateStatus(string $resourceDisplayId, array $body): array
    {
        $id = self::numericId($resourceDisplayId, 'SR');
        $status = self::STATUSES[(string) ($body['status'] ?? '')] ?? null;

        if ($id === null || $status === null) {
            return self::error('Valid resource ID and status are required.', 400);
        }

        $exists = $this->pdo->prepare('select count(*) from study_resource where id = ?');
        $exists->execute([$id]);
        if ((int) $exists->fetchColumn() === 0) {
            return self::error('Resource not found.', 404);
        }

        $message = 'Resource status updated.';
        if ($status === 'MAINTENANCE' && $this->hasActiveSession($id)) {
            $status = 'MAINTENANCE_PENDING';
            $message = 'Maintenance queued after current checkout.';
        }

        $statement = $this->pdo->prepare('update study_resource set status = ? where id = ?');
        $statement->execute([$status, $id]);

        return ['status' => 200, 'body' => ['message' => $message]];
    }

    public function update(string $resourceDisplayId, array $body): array
    {
        $id = self::numericId($resourceDisplayId, 'SR');
        if ($id === null) {
            return self::error('Valid resource ID is required.', 400);
        }

        $name = trim((string) ($body['resourceName'] ?? ''));
        $type = self::TYPES[(string) ($body['resourceType'] ?? '')] ?? null;
        $zone = trim((string) ($body['zoneLocation'] ?? ''));
        $floor = (int) ($body['floor'] ?? 0);
        $capacity = isset($body['capacity']) && $body['capacity'] !== '' ? (int) $body['capacity'] : null;
        $minParticipants = self::minParticipants($body, $type);

        if ($name === '' || $type === null || $zone === '' || $floor < 1) {
            return self::error('Resource name, type, zone, and floor are required.', 400);
        }

        if ($minParticipants === null) {
            return self::error('Minimum participants must be a positive whole number.', 400);
        }

        $exists = $this->pdo->prepare('select count(*) from study_resource where id = ?');
        $exists->execute([$id]);
        if ((int) $exists->fetchColumn() === 0) {
            return self::error('Resource not found.', 404);
        }

        $statement = $this->pdo->prepare(
            'update study_resource
             set resource_name = ?, resource_type = ?, zone_location = ?, floor = ?, has_power_outlet = ?, capacity = ?, min_participants = ?, faculty_exclusive = ?
             where id = ?'
        );
        $statement->execute([
            $name,
            $type,
            $zone,
            $floor,
            !empty($body['hasPowerOutlet']) ? 1 : 0,
            $capacity,
            $minParticipants,
            !empty($body['isFacultyExclusive']) ? 1 : 0,
            $id,
        ]);

        return ['status' => 200, 'body' => ['message' => 'Resource updated.']];
    }

    public function delete(string $resourceDisplayId): array
    {
        $id = self::numericId($resourceDisplayId, 'SR');
        if ($id === null) {
            return self::error('Valid resource ID is required.', 400);
        }

        $reservations = $this->pdo->prepare('select count(*) from reservation where resource_id = ?');
        $reservations->execute([$id]);
        if ((int) $reservations->fetchColumn() > 0) {
            return self::error('Resource has reservations and cannot be deleted.', 409);
        }

        $statement = $this->pdo->prepare('delete from study_resource where id = ?');
        $statement->execute([$id]);
        if ($statement->rowCount() === 0) {
            return self::error('Resource not found.', 404);
        }

        return ['status' => 200, 'body' => ['message' => 'Resource deleted.']];
    }

    private static function error(string $message, int $status): array
    {
        return ['status' => $status, 'body' => ['message' => $message]];
    }

    private static function minParticipants(array $body, ?string $type): ?int
    {
        if (isset($body['minParticipants']) && $body['minParticipants'] !== '') {
            $minParticipants = filter_var($body['minParticipants'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($minParticipants === false) {
                return null;
            }

            return $minParticipants > 0 ? $minParticipants : null;
        }

        return $type === 'GROUP_ROOM' ? 3 : 1;
    }

    private function hasActiveSession(int $resourceId): bool
    {
        $statement = $this->pdo->prepare(
            "select count(*)
             from reservation r
             left join attendance_log a on a.reservation_id = r.id
             where r.resource_id = ?
               and r.status = 'ACTIVE'
               and a.actual_check_out is null"
        );
        $statement->execute([$resourceId]);

        return (int) $statement->fetchColumn() > 0;
    }

    private static function numericId(string $value, string $prefix): ?int
    {
        if (preg_match('/^' . preg_quote($prefix, '/') . '0*(\d+)$/', strtoupper($value), $matches)) {
            return (int) $matches[1];
        }

        return ctype_digit($value) ? (int) $value : null;
    }
}
