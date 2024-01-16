/*
  Warnings:

  - You are about to drop the `team_website` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `team` ADD COLUMN `deleted_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `website` ADD COLUMN `team_id` VARCHAR(36) NULL;

-- DropTable
DROP TABLE `team_website`;

-- CreateIndex
CREATE INDEX `website_team_id_idx` ON `website`(`team_id`);
