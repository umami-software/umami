-- AlterTable
ALTER TABLE `account` ADD COLUMN `is_viewer` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `event_data` DROP PRIMARY KEY,
    MODIFY `event_data_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`event_data_id`);

-- DropTable
DROP TABLE `_event_old`;

-- CreateTable
CREATE TABLE `viewerforwebsite` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `website_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`user_id`, `website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `viewerforwebsite` ADD CONSTRAINT `viewerforwebsite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `account`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewerforwebsite` ADD CONSTRAINT `viewerforwebsite_website_id_fkey` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE CASCADE;
