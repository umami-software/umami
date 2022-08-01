-- DropForeignKey
alter table `event` drop foreign key `event_ibfk_1`;
alter table `event` drop foreign key `event_ibfk_2`;

drop index `event_created_at_idx` on `event`;
drop index `event_session_id_idx` on `event`;
drop index `event_website_id_idx` on `event`;

create index `event_old_created_at_idx` on `event` (created_at);
create index `event_old_session_id_idx` on `event` (session_id);
create index `event_old_website_id_idx` on `event` (website_id);

-- RenameTable
rename table `event` to `_event_old`;

-- CreateTable
create table `event`
(
    event_id   int unsigned auto_increment
        primary key,
    website_id int unsigned                        not null,
    session_id int unsigned                        not null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    url        varchar(500)                        not null,
    event_name varchar(50) NOT NULL,
    constraint event_ibfk_1
        foreign key (website_id) references `website` (website_id)
            on delete cascade,
    constraint event_ibfk_2
        foreign key (session_id) references `session` (session_id)
            on delete cascade
)
    collate = utf8mb4_unicode_ci;

create index `event_created_at_idx`
    on `event` (created_at);

create index `event_session_id_idx`
    on `event` (session_id);

create index `event_website_id_idx`
    on `event` (website_id);


-- CreateTable
CREATE TABLE `event_data` (
    `event_data_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER UNSIGNED NOT NULL,
    `event_data` JSON NOT NULL,

    UNIQUE INDEX `event_data_event_id_key`(`event_id`),
    PRIMARY KEY (`event_data_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_data` ADD CONSTRAINT `event_data_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `event`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `account` RENAME INDEX `username` TO `account_username_key`;

-- RenameIndex
ALTER TABLE `session` RENAME INDEX `session_uuid` TO `session_session_uuid_key`;

-- RenameIndex
ALTER TABLE `website` RENAME INDEX `share_id` TO `website_share_id_key`;

-- RenameIndex
ALTER TABLE `website` RENAME INDEX `website_uuid` TO `website_website_uuid_key`;