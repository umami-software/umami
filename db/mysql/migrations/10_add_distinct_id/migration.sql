-- AlterTable
ALTER TABLE `session` ADD COLUMN `distinct_id` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `session_data` ADD COLUMN `distinct_id` VARCHAR(50) NULL;
