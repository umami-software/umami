-- AlterTable
ALTER TABLE `event` ADD COLUMN `event_name` VARCHAR(50) NULL;

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


/*
  Warnings:

  - You are about to drop the column `event_type` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `event_value` on the `event` table. All the data in the column will be lost.

*/
-- Populate event_name
update `event`
set event_name = event_value;

-- Set event_name not null
ALTER TABLE `event` 
MODIFY `event_name` VARCHAR(50) NOT NULL;

-- Drop old columns
ALTER TABLE `event`
DROP COLUMN `event_type`,
DROP COLUMN `event_value`;