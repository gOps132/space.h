<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use Spaceh\JwtService;
use Spaceh\ReservationService;

function assertTrue(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
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

echo "PHP backend tests passed.\n";
