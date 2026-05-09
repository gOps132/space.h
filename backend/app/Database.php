<?php

declare(strict_types=1);

namespace Spaceh;

use PDO;

final class Database
{
    public static function connect(): PDO
    {
        $pdo = new PDO(Config::dbDsn(), Config::dbUsername(), Config::dbPassword(), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return $pdo;
    }
}
