<?php

declare(strict_types=1);

namespace Spaceh;

use DateTimeImmutable;
use DateTimeZone;
use PDO;

final class LibraryHoursService
{
    private const OPEN_KEY = 'library_open_time';
    private const CLOSE_KEY = 'library_close_time';
    private const DEFAULT_OPEN = '08:00';
    private const DEFAULT_CLOSE = '20:00';
    private const SLOT_MINUTES = 30;
    private const MAX_ADVANCE_DAYS = 30;

    public function __construct(private readonly PDO $pdo)
    {
    }

    public function get(): array
    {
        $settings = $this->settings();

        return [
            'openTime' => $settings[self::OPEN_KEY],
            'closeTime' => $settings[self::CLOSE_KEY],
            'slotMinutes' => self::SLOT_MINUTES,
            'maxAdvanceDays' => self::MAX_ADVANCE_DAYS,
            'timezone' => Config::appTimezone(),
        ];
    }

    public function update(array $body): array
    {
        $openTime = trim((string) ($body['openTime'] ?? ''));
        $closeTime = trim((string) ($body['closeTime'] ?? ''));
        $error = self::validateHours($openTime, $closeTime);
        if ($error !== null) {
            return ['status' => 422, 'body' => ['message' => $error]];
        }

        $statement = $this->pdo->prepare(
            'insert into app_setting (setting_key, setting_value) values (?, ?)
             on duplicate key update setting_value = values(setting_value)'
        );
        $statement->execute([self::OPEN_KEY, $openTime]);
        $statement->execute([self::CLOSE_KEY, $closeTime]);

        return ['status' => 200, 'body' => ['message' => 'Library hours updated.', 'libraryHours' => $this->get()]];
    }

    public function validateReservationWindow(DateTimeImmutable $start, DateTimeImmutable $end): ?string
    {
        $settings = $this->settings();
        $openMinutes = self::timeToMinutes($settings[self::OPEN_KEY]);
        $closeMinutes = self::timeToMinutes($settings[self::CLOSE_KEY]);
        if ($openMinutes === null || $closeMinutes === null || $openMinutes >= $closeMinutes) {
            return 'Library hours are not configured correctly.';
        }

        $timezone = new DateTimeZone(Config::appTimezone());
        $now = new DateTimeImmutable('now', $timezone);
        $startLocal = $start->setTimezone($timezone);
        $endLocal = $end->setTimezone($timezone);

        if ($start <= new DateTimeImmutable('now')) {
            return 'Reservations must start in the future.';
        }

        if ($start > $now->modify('+' . self::MAX_ADVANCE_DAYS . ' days')) {
            return 'Reservations can only be booked up to ' . self::MAX_ADVANCE_DAYS . ' days ahead.';
        }

        if ($startLocal->format('Y-m-d') !== $endLocal->format('Y-m-d')) {
            return 'Reservations must start and end on the same day.';
        }

        if (!self::isSlotAligned($startLocal) || !self::isSlotAligned($endLocal)) {
            return 'Reservation times must use 30-minute increments.';
        }

        $startMinutes = self::dateToMinutes($startLocal);
        $endMinutes = self::dateToMinutes($endLocal);
        if ($startMinutes < $openMinutes || $endMinutes > $closeMinutes) {
            return "Reservations must be within library hours ({$settings[self::OPEN_KEY]}-{$settings[self::CLOSE_KEY]}).";
        }

        return null;
    }

    private function settings(): array
    {
        $settings = [
            self::OPEN_KEY => self::DEFAULT_OPEN,
            self::CLOSE_KEY => self::DEFAULT_CLOSE,
        ];

        $statement = $this->pdo->prepare('select setting_key, setting_value from app_setting where setting_key in (?, ?)');
        $statement->execute([self::OPEN_KEY, self::CLOSE_KEY]);
        foreach ($statement->fetchAll() as $row) {
            $settings[(string) $row['setting_key']] = (string) $row['setting_value'];
        }

        return $settings;
    }

    private static function validateHours(string $openTime, string $closeTime): ?string
    {
        $openMinutes = self::timeToMinutes($openTime);
        $closeMinutes = self::timeToMinutes($closeTime);
        if ($openMinutes === null || $closeMinutes === null) {
            return 'Library hours must use HH:MM format.';
        }

        if ($openMinutes % self::SLOT_MINUTES !== 0 || $closeMinutes % self::SLOT_MINUTES !== 0) {
            return 'Library hours must use 30-minute increments.';
        }

        if ($openMinutes >= $closeMinutes) {
            return 'Library opening time must be before closing time.';
        }

        return null;
    }

    private static function timeToMinutes(string $value): ?int
    {
        if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $value, $matches)) {
            return null;
        }

        return ((int) $matches[1] * 60) + (int) $matches[2];
    }

    private static function dateToMinutes(DateTimeImmutable $value): int
    {
        return ((int) $value->format('G') * 60) + (int) $value->format('i');
    }

    private static function isSlotAligned(DateTimeImmutable $value): bool
    {
        return (int) $value->format('s') === 0 && self::dateToMinutes($value) % self::SLOT_MINUTES === 0;
    }
}
