-- AlterTable
ALTER TABLE `account` ADD COLUMN `account_uuid` VARCHAR(36);

-- Backfill UUID
UPDATE `account` SET account_uuid=(SELECT uuid());

-- AlterTable
ALTER TABLE `account` MODIFY `account_uuid` VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `account_account_uuid_key` ON `account`(`account_uuid`);

-- AlterTable
ALTER TABLE `event` ADD COLUMN `event_uuid` VARCHAR(36);

-- Backfill UUID
UPDATE `event` SET event_uuid=(SELECT uuid());

-- AlterTable
ALTER TABLE `event` MODIFY `event_uuid` VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `event_event_uuid_key` ON `event`(`event_uuid`);

-- CreateIndex
CREATE INDEX `account_account_uuid_idx` ON `account`(`account_uuid`);

-- CreateIndex
CREATE INDEX `session_session_uuid_idx` ON `session`(`session_uuid`);

-- CreateIndex
CREATE INDEX `website_website_uuid_idx` ON `website`(`website_uuid`);

-- CreateIndex
CREATE INDEX `event_event_uuid_idx` ON `event`(`event_uuid`);