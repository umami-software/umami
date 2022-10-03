-- AlterTable
ALTER TABLE `account` ADD COLUMN `account_uuid` VARCHAR(36);

-- Backfill UUID
UPDATE `account` SET account_uuid=(SELECT uuid());

-- AlterTable
ALTER TABLE `account` MODIFY `account_uuid` VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `account_account_uuid_key` ON `account`(`account_uuid`);
