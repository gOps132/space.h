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
        $pdo->exec(
            'create table if not exists app_setting (
                setting_key varchar(80) not null primary key,
                setting_value varchar(255) not null,
                updated_at timestamp not null default current_timestamp on update current_timestamp
            ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci'
        );
        $pdo->exec("insert ignore into app_setting (setting_key, setting_value) values ('library_open_time', '08:00'), ('library_close_time', '20:00')");

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
