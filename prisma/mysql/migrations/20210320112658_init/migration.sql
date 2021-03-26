-- CreateTable
CREATE TABLE `account` (
    `user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
UNIQUE INDEX `account.username_unique`(`username`),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event` (
    `event_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `session_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(500) NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `event_value` VARCHAR(50) NOT NULL,
INDEX `event_created_at_idx`(`created_at`),
INDEX `event_session_id_idx`(`session_id`),
INDEX `event_website_id_idx`(`website_id`),

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pageview` (
    `view_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `session_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(500) NOT NULL,
    `referrer` VARCHAR(500),
INDEX `pageview_created_at_idx`(`created_at`),
INDEX `pageview_session_id_idx`(`session_id`),
INDEX `pageview_website_id_created_at_idx`(`website_id`, `created_at`),
INDEX `pageview_website_id_idx`(`website_id`),
INDEX `pageview_website_id_session_id_created_at_idx`(`website_id`, `session_id`, `created_at`),

    PRIMARY KEY (`view_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `session_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_uuid` VARCHAR(36) NOT NULL,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    `hostname` VARCHAR(100),
    `browser` VARCHAR(20),
    `os` VARCHAR(20),
    `device` VARCHAR(20),
    `screen` VARCHAR(11),
    `language` VARCHAR(35),
    `country` CHAR(2),
UNIQUE INDEX `session.session_uuid_unique`(`session_uuid`),
INDEX `session_created_at_idx`(`created_at`),
INDEX `session_website_id_idx`(`website_id`),

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website` (
    `website_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_uuid` VARCHAR(36) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(500),
    `share_id` VARCHAR(64),
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
UNIQUE INDEX `website.website_uuid_unique`(`website_uuid`),
UNIQUE INDEX `website.share_id_unique`(`share_id`),
INDEX `website_user_id_idx`(`user_id`),

    PRIMARY KEY (`website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event` ADD FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event` ADD FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pageview` ADD FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pageview` ADD FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website` ADD FOREIGN KEY (`user_id`) REFERENCES `account`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
