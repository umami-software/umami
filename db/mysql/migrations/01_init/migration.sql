-- CreateTable
CREATE TABLE `user` (
    `user_id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `user_user_id_key`(`user_id`),
    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `session_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `hostname` VARCHAR(100) NULL,
    `browser` VARCHAR(20) NULL,
    `os` VARCHAR(20) NULL,
    `device` VARCHAR(20) NULL,
    `screen` VARCHAR(11) NULL,
    `language` VARCHAR(35) NULL,
    `country` CHAR(2) NULL,
    `subdivision1` CHAR(20) NULL,
    `subdivision2` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `session_session_id_key`(`session_id`),
    INDEX `session_created_at_idx`(`created_at`),
    INDEX `session_website_id_idx`(`website_id`),
    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website` (
    `website_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(500) NULL,
    `share_id` VARCHAR(50) NULL,
    `reset_at` TIMESTAMP(0) NULL,
    `user_id` VARCHAR(36) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `website_website_id_key`(`website_id`),
    UNIQUE INDEX `website_share_id_key`(`share_id`),
    INDEX `website_user_id_idx`(`user_id`),
    INDEX `website_created_at_idx`(`created_at`),
    INDEX `website_share_id_idx`(`share_id`),
    PRIMARY KEY (`website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_event` (
    `event_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `url_path` VARCHAR(500) NOT NULL,
    `url_query` VARCHAR(500) NULL,
    `referrer_path` VARCHAR(500) NULL,
    `referrer_query` VARCHAR(500) NULL,
    `referrer_domain` VARCHAR(500) NULL,
    `page_title` VARCHAR(500) NULL,
    `event_type` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `event_name` VARCHAR(50) NULL,

    INDEX `website_event_created_at_idx`(`created_at`),
    INDEX `website_event_session_id_idx`(`session_id`),
    INDEX `website_event_website_id_idx`(`website_id`),
    INDEX `website_event_website_id_created_at_idx`(`website_id`, `created_at`),
    INDEX `website_event_website_id_session_id_created_at_idx`(`website_id`, `session_id`, `created_at`),
    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_data` (
    `event_id` VARCHAR(36) NOT NULL,
    `website_event_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `event_key` VARCHAR(500) NOT NULL,
    `event_string_value` VARCHAR(500) NULL,
    `event_numeric_value` DECIMAL(19, 4) NULL,
    `event_date_value` TIMESTAMP(0) NULL,
    `event_data_type` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `event_data_created_at_idx`(`created_at`),
    INDEX `event_data_website_id_idx`(`website_id`),
    INDEX `event_data_website_event_id_idx`(`website_event_id`),
    INDEX `event_data_website_id_website_event_id_created_at_idx`(`website_id`, `website_event_id`, `created_at`),
    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `team_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `access_code` VARCHAR(50) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `team_team_id_key`(`team_id`),
    UNIQUE INDEX `team_access_code_key`(`access_code`),
    INDEX `team_access_code_idx`(`access_code`),
    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_user` (
    `team_user_id` VARCHAR(36) NOT NULL,
    `team_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `team_user_team_user_id_key`(`team_user_id`),
    INDEX `team_user_team_id_idx`(`team_id`),
    INDEX `team_user_user_id_idx`(`user_id`),
    PRIMARY KEY (`team_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_website` (
    `team_website_id` VARCHAR(36) NOT NULL,
    `team_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `team_website_team_website_id_key`(`team_website_id`),
    INDEX `team_website_team_id_idx`(`team_id`),
    INDEX `team_website_website_id_idx`(`website_id`),
    PRIMARY KEY (`team_website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddSystemUser
INSERT INTO user (user_id, username, role, password) VALUES ('41e2b680-648e-4b09-bcd7-3e2b10c06264' , 'admin', 'admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa');