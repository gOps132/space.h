<?php

declare(strict_types=1);

namespace Spaceh;

final class Config
{
    public static function dbDsn(): string
    {
        $host = getenv('SPACEH_DB_HOST') ?: '127.0.0.1';
        $port = getenv('SPACEH_DB_PORT') ?: '3306';
        $database = getenv('SPACEH_DB_NAME') ?: 'spaceh';

        return "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
    }

    public static function dbUsername(): string
    {
        return getenv('SPACEH_DB_USERNAME') ?: 'spaceh';
    }

    public static function dbPassword(): string
    {
        return getenv('SPACEH_DB_PASSWORD') ?: 'spaceh';
    }

    public static function jwtSecret(): string
    {
        return getenv('SPACEH_JWT_SECRET') ?: 'spaceh-development-secret-spaceh-development-secret';
    }

    public static function jwtExpirationSeconds(): int
    {
        $minutes = (int) (getenv('SPACEH_JWT_EXPIRATION_MINUTES') ?: '120');
        return max(1, $minutes) * 60;
    }

    public static function allowedOrigin(): string
    {
        return getenv('SPACEH_ALLOWED_ORIGIN') ?: 'http://localhost:5173';
    }

}
