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

        self::migrate($pdo);

        return $pdo;
    }

    private static function migrate(PDO $pdo): void
    {
        $statement = $pdo->prepare(
            "select count(*)
             from information_schema.columns
             where table_schema = database()
               and table_name = 'study_resource'
               and column_name = 'min_participants'"
        );
        $statement->execute();

        if ((int) $statement->fetchColumn() === 0) {
            $pdo->exec('alter table study_resource add column min_participants int not null default 1 after capacity');
            $pdo->exec("update study_resource set min_participants = case when resource_type = 'GROUP_ROOM' and faculty_exclusive = 0 then 3 else 1 end");
        }
    }
}
