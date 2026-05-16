<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use Spaceh\JwtService;
use Spaceh\Database;
use Spaceh\ReservationService;
use Spaceh\ResourceService;
use Spaceh\SeedData;

function assertTrue(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

function cleanupMaintenanceTestData(PDO $pdo): void
{
    $pdo->exec(
        "delete a
         from attendance_log a
         join reservation r on r.id = a.reservation_id
         left join study_resource sr on sr.id = r.resource_id
         left join app_user u on u.id = r.user_id
         where sr.resource_name like 'Occupied Maintenance %'
            or sr.resource_name like 'Available Maintenance %'
            or sr.resource_name like 'Window Validation %'
            or sr.resource_name like 'Booking %'
            or u.email like 'maintenance-%@spaceh.test'
            or u.email like 'booking-%@spaceh.test'
            or u.email like 'window-%@spaceh.test'"
    );
    $pdo->exec(
        "delete rp
         from reservation_participant rp
         join reservation r on r.id = rp.reservation_id
         left join study_resource sr on sr.id = r.resource_id
         left join app_user u on u.id = r.user_id
         where sr.resource_name like 'Occupied Maintenance %'
            or sr.resource_name like 'Available Maintenance %'
            or sr.resource_name like 'Window Validation %'
            or sr.resource_name like 'Booking %'
            or u.email like 'maintenance-%@spaceh.test'
            or u.email like 'booking-%@spaceh.test'
            or u.email like 'window-%@spaceh.test'"
    );
    $pdo->exec(
        "delete r
         from reservation r
         left join study_resource sr on sr.id = r.resource_id
         left join app_user u on u.id = r.user_id
         where sr.resource_name like 'Occupied Maintenance %'
            or sr.resource_name like 'Available Maintenance %'
            or sr.resource_name like 'Window Validation %'
            or sr.resource_name like 'Booking %'
            or u.email like 'maintenance-%@spaceh.test'
            or u.email like 'booking-%@spaceh.test'
            or u.email like 'window-%@spaceh.test'"
    );
    $pdo->exec("delete from study_resource where resource_name like 'Occupied Maintenance %' or resource_name like 'Available Maintenance %' or resource_name like 'Window Validation %' or resource_name like 'Booking %'");
    $pdo->exec("delete from app_user where email like 'maintenance-%@spaceh.test' or email like 'booking-%@spaceh.test' or email like 'window-%@spaceh.test'");
}

$jwt = new JwtService();
$token = $jwt->issue('24-0001-01', ['role' => 'STUDENT']);
$claims = $jwt->verify($token);

assertTrue(is_array($claims), 'JWT verifies');
assertTrue($claims['sub'] === '24-0001-01', 'JWT subject round-trips');
assertTrue($claims['role'] === 'STUDENT', 'JWT role claim round-trips');
assertTrue($jwt->verify($token . 'broken') === null, 'JWT rejects tampered token');
assertTrue((bool) preg_match('/^\d{2}-\d{4}(-\d{2})?$/', '24-0001-01'), 'new university ID format accepted');
assertTrue((bool) preg_match('/^\d{2}-\d{4}(-\d{2})?$/', '23-1024'), 'old university ID format accepted');
assertTrue(!preg_match('/^\d{2}-\d{4}(-\d{2})?$/', '2024-0001'), 'malformed university ID rejected');

$graceCheck = new ReflectionMethod(ReservationService::class, 'checkInGraceExpired');
$graceCheck->setAccessible(true);
$startTime = '2026-05-10 09:00:00';
assertTrue($graceCheck->invoke(null, $startTime, new DateTimeImmutable('2026-05-10 09:15:00')) === false, 'check-in grace includes the 15-minute mark');
assertTrue($graceCheck->invoke(null, $startTime, new DateTimeImmutable('2026-05-10 09:16:00')) === true, 'check-in grace expires after 15 minutes');

$pdo = Database::connect();
cleanupMaintenanceTestData($pdo);
$resourceService = new ResourceService($pdo);
$reservationService = new ReservationService($pdo);

$scopeSuffix = (string) random_int(1000, 9999);
$facultyScopeUniversityId = "94-{$scopeSuffix}";
$pdo->beginTransaction();
try {
    $pdo->prepare(
        'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
    )->execute([$facultyScopeUniversityId, 'Faculty Scope Tester', "faculty-scope-{$scopeSuffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'FACULTY', 'ACTIVE']);
    $pdo->prepare(
        'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
    )->execute(["93-{$scopeSuffix}", 'Student Scope Tester', "student-scope-{$scopeSuffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
    $studentScopeUserId = (int) $pdo->lastInsertId();

    $pdo->prepare(
        'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute(["Faculty Scope Room {$scopeSuffix}", 'GROUP_ROOM', 'Tests', 1, 'AVAILABLE', 1, 6, 3, 0]);
    $facultyScopeRoomId = (int) $pdo->lastInsertId();

    $pdo->prepare(
        'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute(["Faculty Scope Seat {$scopeSuffix}", 'INDIVIDUAL_SEAT', 'Tests', 1, 'AVAILABLE', 1, null, 1, 0]);
    $facultyScopeSeatId = (int) $pdo->lastInsertId();

    $scopeStart = (new DateTimeImmutable('+1 day'))->setTime(10, 0)->format('Y-m-d H:i:s');
    $scopeEnd = (new DateTimeImmutable('+1 day'))->setTime(11, 0)->format('Y-m-d H:i:s');
    $insertScopeReservation = $pdo->prepare('insert into reservation (user_id, resource_id, start_time, end_time, status) values (?, ?, ?, ?, ?)');
    $insertScopeReservation->execute([$studentScopeUserId, $facultyScopeRoomId, $scopeStart, $scopeEnd, 'PENDING']);
    $insertScopeReservation->execute([$studentScopeUserId, $facultyScopeSeatId, $scopeStart, $scopeEnd, 'PENDING']);

    $facultyScopeReservations = (new Spaceh\DataApi($pdo))->reservations(['role' => 'FACULTY', 'universityId' => $facultyScopeUniversityId]);
    $facultyScopeResourceIds = array_column($facultyScopeReservations, 'resource_id');
    $facultyCanSeeRoomReservation = in_array('SR' . str_pad((string) $facultyScopeRoomId, 3, '0', STR_PAD_LEFT), $facultyScopeResourceIds, true);
    $facultyCanSeeOrdinarySeatReservation = in_array('SR' . str_pad((string) $facultyScopeSeatId, 3, '0', STR_PAD_LEFT), $facultyScopeResourceIds, true);
} finally {
    $pdo->rollBack();
}

assertTrue($facultyCanSeeRoomReservation, 'faculty reservation feed includes room reservations owned by other users');
assertTrue(!$facultyCanSeeOrdinarySeatReservation, 'faculty reservation feed excludes ordinary seat reservations owned by other users');

$suffix = bin2hex(random_bytes(4));
$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute(["98-{$suffix}", 'Maintenance Tester', "maintenance-{$suffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$userId = (int) $pdo->lastInsertId();

$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute(["97-{$suffix}", 'Booking Tester', "booking-{$suffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$bookingOwnerUniversityId = "97-{$suffix}";

$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute(["97-{$suffix}-01", 'Booking Group Member One', "booking-member-one-{$suffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$bookingMemberOneUniversityId = "97-{$suffix}-01";

$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute(["97-{$suffix}-02", 'Booking Group Member Two', "booking-member-two-{$suffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$bookingMemberTwoUniversityId = "97-{$suffix}-02";

$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute(["97-{$suffix}-03", 'Booking Alternate Owner', "booking-alt-owner-{$suffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$bookingAltOwnerUniversityId = "97-{$suffix}-03";

SeedData::ensure($pdo);
$demoAdmin = $pdo->prepare("select count(*) from app_user where university_id = '22-7777-03' and role = 'ADMIN'");
$demoAdmin->execute();
assertTrue((int) $demoAdmin->fetchColumn() === 1, 'seed data ensures demo admin even when test users already exist');
$seededStudents = $pdo->query("select count(*) from app_user where university_id between '24-0002-01' and '24-0011-01' and role = 'STUDENT'")->fetchColumn();
$seededFaculty = $pdo->query("select count(*) from app_user where university_id between '23-2001-01' and '23-2010-01' and role = 'FACULTY'")->fetchColumn();
assertTrue((int) $seededStudents === 10, 'seed data includes ten extra student users');
assertTrue((int) $seededFaculty === 10, 'seed data includes ten extra faculty users');

$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Booking Group Room {$suffix}", 'GROUP_ROOM', 'Tests', 1, 'AVAILABLE', 1, 6, 3, 0]);
$groupResourceId = (int) $pdo->lastInsertId();
$groupResourceDisplayId = 'SR' . str_pad((string) $groupResourceId, 3, '0', STR_PAD_LEFT);

$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Booking Alternate Room {$suffix}", 'GROUP_ROOM', 'Tests', 1, 'AVAILABLE', 1, 6, 3, 0]);
$alternateGroupResourceId = (int) $pdo->lastInsertId();
$alternateGroupResourceDisplayId = 'SR' . str_pad((string) $alternateGroupResourceId, 3, '0', STR_PAD_LEFT);

$testTimezone = new DateTimeZone('Asia/Manila');
$groupStart = (new DateTimeImmutable('now', $testTimezone))->modify('+2 days')->setTime(10, 0);
$groupEnd = $groupStart->modify('+1 hour');
$invalidCoBookerResponse = $reservationService->create(
    ['universityId' => $bookingOwnerUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $groupResourceDisplayId,
        'startTime' => $groupStart->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingMemberOneUniversityId, "missing-{$suffix}"],
    ]
);
assertTrue($invalidCoBookerResponse['status'] === 422, 'backend rejects co-booker IDs that are not registered users');

$selfCoBookerResponse = $reservationService->create(
    ['universityId' => $bookingOwnerUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $groupResourceDisplayId,
        'startTime' => $groupStart->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingOwnerUniversityId, $bookingMemberOneUniversityId],
    ]
);
assertTrue($selfCoBookerResponse['status'] === 422, 'backend rejects owner as their own co-booker');

$duplicateCoBookerResponse = $reservationService->create(
    ['universityId' => $bookingOwnerUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $groupResourceDisplayId,
        'startTime' => $groupStart->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingMemberOneUniversityId, $bookingMemberOneUniversityId],
    ]
);
assertTrue($duplicateCoBookerResponse['status'] === 422, 'backend rejects duplicate co-bookers');

$groupBookingResponse = $reservationService->create(
    ['universityId' => $bookingOwnerUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $groupResourceDisplayId,
        'startTime' => $groupStart->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingMemberOneUniversityId, $bookingMemberTwoUniversityId],
    ]
);
assertTrue($groupBookingResponse['status'] === 201, 'backend creates group booking with registered co-bookers');

$participantBookingResponse = $reservationService->create(
    ['universityId' => $bookingMemberOneUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $alternateGroupResourceDisplayId,
        'startTime' => $groupStart->modify('+2 hours')->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->modify('+2 hours')->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingAltOwnerUniversityId, $bookingMemberTwoUniversityId],
    ]
);
assertTrue(
    $participantBookingResponse['status'] === 409,
    'co-booker is treated as booked and cannot create another active booking: ' . $participantBookingResponse['status'] . ' ' . ($participantBookingResponse['body']['message'] ?? '')
);

$coBookerConflictResponse = $reservationService->create(
    ['universityId' => $bookingAltOwnerUniversityId, 'role' => 'STUDENT'],
    [
        'resourceId' => $alternateGroupResourceDisplayId,
        'startTime' => $groupStart->modify('+3 hours')->format(DateTimeInterface::ATOM),
        'endTime' => $groupEnd->modify('+3 hours')->format(DateTimeInterface::ATOM),
        'coBookers' => [$bookingMemberOneUniversityId, $bookingMemberTwoUniversityId],
    ]
);
assertTrue($coBookerConflictResponse['status'] === 409, 'backend rejects co-bookers who already have an active group booking');

$participantReservations = (new Spaceh\DataApi($pdo))->reservations(['role' => 'STUDENT', 'universityId' => $bookingMemberOneUniversityId]);
$participantReservation = $participantReservations[0] ?? null;
assertTrue($participantReservation !== null && $participantReservation['reservation_id'] === $groupBookingResponse['body']['reservationId'], 'co-booker sees group booking in reservation feed');
assertTrue(($participantReservation['user_name'] ?? null) === 'Booking Tester', 'reservation feed includes booking owner name');
assertTrue(($participantReservation['current_user_role'] ?? null) === 'co_booker', 'co-booker reservation feed marks current user as co-booker');
assertTrue(($participantReservation['co_bookers'][0]['full_name'] ?? null) === 'Booking Group Member One', 'reservation feed includes co-booker names');

$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Occupied Maintenance {$suffix}", 'INDIVIDUAL_SEAT', 'Tests', 1, 'OCCUPIED', 1, null, 1, 0]);
$occupiedResourceId = (int) $pdo->lastInsertId();

$pdo->prepare(
    "insert into reservation (user_id, resource_id, start_time, end_time, status) values (?, ?, date_sub(now(), interval 10 minute), date_add(now(), interval 50 minute), 'ACTIVE')"
)->execute([$userId, $occupiedResourceId]);
$activeReservationId = (int) $pdo->lastInsertId();
$pdo->prepare('insert into attendance_log (reservation_id, actual_check_in) values (?, now())')->execute([$activeReservationId]);

$maintenanceResponse = $resourceService->updateStatus('SR' . str_pad((string) $occupiedResourceId, 3, '0', STR_PAD_LEFT), ['status' => 'Under Maintenance']);
assertTrue($maintenanceResponse['status'] === 200, 'occupied resource accepts maintenance request');
assertTrue((string) $pdo->query("select status from study_resource where id = {$occupiedResourceId}")->fetchColumn() === 'MAINTENANCE_PENDING', 'occupied resource queues maintenance instead of kicking active user');

$futureStart = (new DateTimeImmutable('+1 day'))->setTime(10, 0);
$futureEnd = $futureStart->modify('+1 hour');
$blockedBooking = $reservationService->create(
    ['universityId' => "97-{$suffix}", 'role' => 'STUDENT'],
    ['resourceId' => 'SR' . str_pad((string) $occupiedResourceId, 3, '0', STR_PAD_LEFT), 'startTime' => $futureStart->format(DateTimeInterface::ATOM), 'endTime' => $futureEnd->format(DateTimeInterface::ATOM)]
);
assertTrue($blockedBooking['status'] === 409, 'queued maintenance blocks future bookings');

$checkoutResponse = $reservationService->checkOut(['universityId' => '22-7777-03', 'role' => 'ADMIN'], 'RES' . str_pad((string) $activeReservationId, 3, '0', STR_PAD_LEFT));
assertTrue($checkoutResponse['status'] === 200, 'active reservation can check out while maintenance is queued');
assertTrue((string) $pdo->query("select status from study_resource where id = {$occupiedResourceId}")->fetchColumn() === 'MAINTENANCE', 'queued maintenance becomes under maintenance after checkout');

$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Available Maintenance {$suffix}", 'INDIVIDUAL_SEAT', 'Tests', 1, 'AVAILABLE', 1, null, 1, 0]);
$availableResourceId = (int) $pdo->lastInsertId();
$immediateMaintenance = $resourceService->updateStatus('SR' . str_pad((string) $availableResourceId, 3, '0', STR_PAD_LEFT), ['status' => 'Under Maintenance']);
assertTrue($immediateMaintenance['status'] === 200, 'available resource accepts maintenance request');
assertTrue((string) $pdo->query("select status from study_resource where id = {$availableResourceId}")->fetchColumn() === 'MAINTENANCE', 'available resource enters maintenance immediately');

cleanupMaintenanceTestData($pdo);

$windowSuffix = bin2hex(random_bytes(4));
register_shutdown_function(function () use ($pdo): void {
    cleanupMaintenanceTestData($pdo);
});
$timezone = new DateTimeZone('Asia/Manila');
$windowUserId = "96-{$windowSuffix}";
$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute([$windowUserId, 'Window Tester', "window-{$windowSuffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Window Validation {$windowSuffix}", 'INDIVIDUAL_SEAT', 'Tests', 1, 'AVAILABLE', 1, null, 1, 0]);
$windowResourceId = 'SR' . str_pad((string) $pdo->lastInsertId(), 3, '0', STR_PAD_LEFT);
$futureDay = (new DateTimeImmutable('now', $timezone))->modify('+1 day')->setTime(10, 0);

$pastResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => (new DateTimeImmutable('-1 hour'))->format(DateTimeInterface::ATOM), 'endTime' => (new DateTimeImmutable('+1 hour'))->format(DateTimeInterface::ATOM)]
);
assertTrue($pastResponse['status'] === 422, 'backend rejects reservation start in the past');

$crossDayResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => $futureDay->setTime(19, 30)->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->modify('+1 day')->setTime(8, 30)->format(DateTimeInterface::ATOM)]
);
assertTrue($crossDayResponse['status'] === 422, 'backend rejects reservations that cross local dates');

$slotResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => $futureDay->setTime(10, 15)->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->setTime(11, 15)->format(DateTimeInterface::ATOM)]
);
assertTrue($slotResponse['status'] === 422, 'backend rejects non-30-minute reservation boundaries');

$reversedSameDayResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => $futureDay->setTime(20, 0)->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->setTime(12, 0)->format(DateTimeInterface::ATOM)]
);
assertTrue($reversedSameDayResponse['status'] === 400, 'backend rejects manual end times before start time');

$tooFarResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => $futureDay->modify('+31 days')->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->modify('+31 days')->setTime(11, 0)->format(DateTimeInterface::ATOM)]
);
assertTrue($tooFarResponse['status'] === 422, 'backend rejects reservations more than 30 days ahead');

$hoursService = new Spaceh\LibraryHoursService($pdo);
$hoursResponse = $hoursService->update(['openTime' => '09:00', 'closeTime' => '17:00']);
assertTrue($hoursResponse['status'] === 200, 'admin can update library hours');

$outsideHoursResponse = $reservationService->create(
    ['universityId' => $windowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $windowResourceId, 'startTime' => $futureDay->setTime(8, 0)->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->setTime(9, 0)->format(DateTimeInterface::ATOM)]
);
assertTrue($outsideHoursResponse['status'] === 422, 'backend rejects reservations outside configured library hours');

$hoursService->update(['openTime' => '08:00', 'closeTime' => '22:00']);
$closingWindowUserId = "95-{$windowSuffix}";
$pdo->prepare(
    'insert into app_user (university_id, full_name, email, password_hash, role, account_status) values (?, ?, ?, ?, ?, ?)'
)->execute([$closingWindowUserId, 'Closing Window Tester', "window-closing-{$windowSuffix}@spaceh.test", password_hash('test-pass', PASSWORD_DEFAULT), 'STUDENT', 'ACTIVE']);
$pdo->prepare(
    'insert into study_resource (resource_name, resource_type, zone_location, floor, status, has_power_outlet, capacity, min_participants, faculty_exclusive) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute(["Window Validation Closing {$windowSuffix}", 'INDIVIDUAL_SEAT', 'Tests', 1, 'AVAILABLE', 1, null, 1, 0]);
$closingWindowResourceId = 'SR' . str_pad((string) $pdo->lastInsertId(), 3, '0', STR_PAD_LEFT);
$closingWindowResponse = $reservationService->create(
    ['universityId' => $closingWindowUserId, 'role' => 'STUDENT'],
    ['resourceId' => $closingWindowResourceId, 'startTime' => $futureDay->setTime(18, 0)->format(DateTimeInterface::ATOM), 'endTime' => $futureDay->setTime(22, 0)->format(DateTimeInterface::ATOM)]
);
assertTrue($closingWindowResponse['status'] === 201, 'backend accepts reservations that end at configured closing time');

$hoursService->update(['openTime' => '08:00', 'closeTime' => '20:00']);
cleanupMaintenanceTestData($pdo);

echo "PHP backend tests passed.\n";
