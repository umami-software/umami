/*
  Warnings:

  - You are about to drop the `team_website` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `team` ADD COLUMN `deleted_at` TIMESTAMP(0) NULL,
    ADD COLUMN `logo_url` VARCHAR(2183) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `display_name` VARCHAR(255) NULL,
    ADD COLUMN `logo_url` VARCHAR(2183) NULL;

-- AlterTable
ALTER TABLE `website` ADD COLUMN `created_by` VARCHAR(36) NULL,
    ADD COLUMN `team_id` VARCHAR(36) NULL;

-- MigrateData
UPDATE `website` SET created_by = user_id WHERE team_id IS NULL;

-- DropTable
DROP TABLE `team_website`;

-- CreateIndex
CREATE INDEX `website_team_id_idx` ON `website`(`team_id`);

-- CreateIndex
CREATE INDEX `website_created_by_idx` ON `website`(`created_by`);
