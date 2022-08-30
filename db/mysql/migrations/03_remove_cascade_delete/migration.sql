-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_ibfk_2`;

-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_ibfk_1`;

-- DropForeignKey
ALTER TABLE `pageview` DROP FOREIGN KEY `pageview_ibfk_2`;

-- DropForeignKey
ALTER TABLE `pageview` DROP FOREIGN KEY `pageview_ibfk_1`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `session_ibfk_1`;

-- DropForeignKey
ALTER TABLE `website` DROP FOREIGN KEY `website_ibfk_1`;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_website_id_fkey` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pageview` ADD CONSTRAINT `pageview_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pageview` ADD CONSTRAINT `pageview_website_id_fkey` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_website_id_fkey` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website` ADD CONSTRAINT `website_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `account`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
