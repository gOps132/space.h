<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class SeedData
{
    public static function ensure(PDO $pdo): void
    {
        $count = (int) $pdo->query('select count(*) from app_user')->fetchColumn();
        if ($count > 0) {
            return;
        }

        $users = [
            ['24-0001-01', 'Ada Lovelace', 'ada@spaceh.test', 'library-pass', 'STUDENT'],
            ['23-1024', 'Grace Hopper', 'grace@spaceh.test', 'compiler-pass', 'FACULTY'],
            ['22-7777-03', 'Katherine Johnson', 'katherine@spaceh.test', 'orbit-pass', 'ADMIN'],
        ];

        $insertUser = $pdo->prepare(
            'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
        );
        foreach ($users as [$universityId, $fullName, $email, $password, $role]) {
            $insertUser->execute([$universityId, $fullName, $email, password_hash($password, PASSWORD_DEFAULT), $role, 'ACTIVE']);
        }

        $resources = [
            ['Floor 1 - Desk 04', 'INDIVIDUAL_SEAT', 'Commons', 1, 'AVAILABLE', 1, null, 1, 0],
            ['Floor 2 - Desk 42', 'INDIVIDUAL_SEAT', 'Silent Zone', 2, 'RESERVED', 1, null, 1, 0],
            ['Consultation Room A', 'CONSULTATION_ROOM', 'Faculty Wing', 3, 'AVAILABLE', 1, 6, 1, 1],
            ['Study Room 3B', 'GROUP_ROOM', 'Collaborative Zone', 3, 'OCCUPIED', 1, 8, 3, 0],
        ];

        $insertResource = $pdo->prepare(
            'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($resources as $resource) {
            $insertResource->execute($resource);
        }

        $pdo->exec(
            "insert into reservation (user_id, resource_id, start_time, end_time, status)
             select u.id, r.id, '2026-05-09 09:00:00', '2026-05-09 11:00:00', 'PENDING'
             from app_user u, study_resource r
             where u.university_id = '24-0001-01' and r.resource_name = 'Floor 2 - Desk 42'"
        );
    }
}
