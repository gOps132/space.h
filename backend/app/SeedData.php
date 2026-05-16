<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class SeedData
{
    public static function ensure(PDO $pdo): void
    {
        $users = [
            ['24-0001-01', 'Ada Lovelace', 'ada@spaceh.test', 'library-pass', 'STUDENT'],
            ['23-1024', 'Grace Hopper', 'grace@spaceh.test', 'compiler-pass', 'FACULTY'],
            ['22-7777-03', 'Katherine Johnson', 'katherine@spaceh.test', 'orbit-pass', 'ADMIN'],
            ['24-0002-01', 'Maya Santos', 'maya.santos@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0003-01', 'Leo Reyes', 'leo.reyes@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0004-01', 'Nina Cruz', 'nina.cruz@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0005-01', 'Carlos Tan', 'carlos.tan@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0006-01', 'Iris Lim', 'iris.lim@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0007-01', 'Theo Garcia', 'theo.garcia@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0008-01', 'Sofia Aquino', 'sofia.aquino@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0009-01', 'Marco Villanueva', 'marco.villanueva@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0010-01', 'Elena Mendoza', 'elena.mendoza@spaceh.test', 'student-pass', 'STUDENT'],
            ['24-0011-01', 'Paolo Navarro', 'paolo.navarro@spaceh.test', 'student-pass', 'STUDENT'],
            ['23-2001-01', 'Dr. Amelia Ramos', 'amelia.ramos@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2002-01', 'Prof. Benjamin Sy', 'benjamin.sy@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2003-01', 'Dr. Clara Dizon', 'clara.dizon@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2004-01', 'Prof. Daniel Ong', 'daniel.ong@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2005-01', 'Dr. Elise Mercado', 'elise.mercado@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2006-01', 'Prof. Felix Bautista', 'felix.bautista@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2007-01', 'Dr. Gia Castillo', 'gia.castillo@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2008-01', 'Prof. Hugo Salcedo', 'hugo.salcedo@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2009-01', 'Dr. Isla Fernandez', 'isla.fernandez@spaceh.test', 'faculty-pass', 'FACULTY'],
            ['23-2010-01', 'Prof. Julian Torres', 'julian.torres@spaceh.test', 'faculty-pass', 'FACULTY'],
        ];

        $userExists = $pdo->prepare('select count(*) from app_user where university_id = ?');
        $insertUser = $pdo->prepare(
            'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
        );
        foreach ($users as [$universityId, $fullName, $email, $password, $role]) {
            $userExists->execute([$universityId]);
            if ((int) $userExists->fetchColumn() > 0) {
                continue;
            }

            $insertUser->execute([$universityId, $fullName, $email, password_hash($password, PASSWORD_DEFAULT), $role, 'ACTIVE']);
        }

        $resourceCount = (int) $pdo->query('select count(*) from study_resource')->fetchColumn();
        if ($resourceCount > 0) {
            return;
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
