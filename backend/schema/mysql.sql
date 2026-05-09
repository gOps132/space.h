create table if not exists app_user (
    id bigint unsigned not null auto_increment primary key,
    university_id varchar(50) not null unique,
    full_name varchar(150) not null,
    email varchar(150) not null unique,
    password_hash varchar(255) not null,
    role varchar(30) not null,
    account_status varchar(30) not null,
    banned_until timestamp null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists study_resource (
    id bigint unsigned not null auto_increment primary key,
    resource_name varchar(120) not null,
    resource_type varchar(40) not null,
    zone_location varchar(80) not null,
    floor int not null,
    status varchar(40) not null,
    has_power_outlet boolean not null default false,
    capacity int null,
    min_participants int not null default 1,
    faculty_exclusive boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists reservation (
    id bigint unsigned not null auto_increment primary key,
    user_id bigint unsigned not null,
    resource_id bigint unsigned not null,
    start_time timestamp not null,
    end_time timestamp not null,
    status varchar(40) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    constraint fk_reservation_user foreign key (user_id) references app_user(id),
    constraint fk_reservation_resource foreign key (resource_id) references study_resource(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists reservation_participant (
    id bigint unsigned not null auto_increment primary key,
    reservation_id bigint unsigned not null,
    participant_university_id varchar(50) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_participant_reservation foreign key (reservation_id) references reservation(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists attendance_log (
    id bigint unsigned not null auto_increment primary key,
    reservation_id bigint unsigned not null unique,
    actual_check_in timestamp null,
    actual_check_out timestamp null,
    session_notes varchar(500) null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    constraint fk_attendance_reservation foreign key (reservation_id) references reservation(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists issue_report (
    id bigint unsigned not null auto_increment primary key,
    reported_by_user_id bigint unsigned not null,
    resource_id bigint unsigned not null,
    issue_type varchar(40) not null,
    description varchar(500) not null,
    status varchar(40) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    constraint fk_issue_reporter foreign key (reported_by_user_id) references app_user(id),
    constraint fk_issue_resource foreign key (resource_id) references study_resource(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create index idx_reservation_user_status on reservation(user_id, status);
create index idx_reservation_resource_window on reservation(resource_id, start_time, end_time);
create index idx_resource_status on study_resource(status);
create index idx_issue_status on issue_report(status);
