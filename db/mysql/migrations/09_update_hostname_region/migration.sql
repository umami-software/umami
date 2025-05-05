-- AlterTable
ALTER TABLE `website_event` ADD COLUMN `hostname` VARCHAR(100) NULL;

-- DataMigration
UPDATE `website_event` w
JOIN `session` s
ON s.website_id = w.website_id
    and s.session_id = w.session_id
SET w.hostname = s.hostname;    

-- DropIndex
DROP INDEX `session_website_id_created_at_hostname_idx` ON `session`;
DROP INDEX `session_website_id_created_at_subdivision1_idx` ON `session`;

-- AlterTable
ALTER TABLE `session` RENAME COLUMN `subdivision1` TO `region`;
ALTER TABLE `session` DROP COLUMN `subdivision2`;
ALTER TABLE `session` DROP COLUMN `hostname`;

-- CreateIndex
CREATE INDEX `website_event_website_id_created_at_hostname_idx` ON `website_event`(`website_id`, `created_at`, `hostname`);
CREATE INDEX `session_website_id_created_at_region_idx` ON `session`(`website_id`, `created_at`, `region`);