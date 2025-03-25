-- AlterTable
ALTER TABLE `website_event` ADD COLUMN `tag` VARCHAR(50) NULL;

-- CreateIndex
CREATE INDEX `website_event_website_id_created_at_tag_idx` ON `website_event`(`website_id`, `created_at`, `tag`);
