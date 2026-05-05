-- OceanBase Schema for Umami
-- Compatible with OceanBase MySQL mode
-- Supports column store for analytics optimization

-- Create database
CREATE DATABASE IF NOT EXISTS umami;
USE umami;

-- User table
CREATE TABLE IF NOT EXISTS `user` (
    `user_id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `logo_url` VARCHAR(2183),
    `display_name` VARCHAR(255),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `user_username_key` (`username`),
    INDEX `idx_user_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session table
CREATE TABLE IF NOT EXISTS `session` (
    `session_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `browser` VARCHAR(20),
    `os` VARCHAR(20),
    `device` VARCHAR(20),
    `screen` VARCHAR(11),
    `language` VARCHAR(35),
    `country` CHAR(2),
    `region` VARCHAR(20),
    `city` VARCHAR(50),
    `distinct_id` VARCHAR(50),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`session_id`),
    INDEX `idx_session_created_at` (`created_at`),
    INDEX `idx_session_website_id` (`website_id`),
    INDEX `idx_session_website_created` (`website_id`, `created_at`),
    INDEX `idx_session_website_created_browser` (`website_id`, `created_at`, `browser`),
    INDEX `idx_session_website_created_os` (`website_id`, `created_at`, `os`),
    INDEX `idx_session_website_created_device` (`website_id`, `created_at`, `device`),
    INDEX `idx_session_website_created_screen` (`website_id`, `created_at`, `screen`),
    INDEX `idx_session_website_created_language` (`website_id`, `created_at`, `language`),
    INDEX `idx_session_website_created_country` (`website_id`, `created_at`, `country`),
    INDEX `idx_session_website_created_region` (`website_id`, `created_at`, `region`),
    INDEX `idx_session_website_created_city` (`website_id`, `created_at`, `city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Website table
CREATE TABLE IF NOT EXISTS `website` (
    `website_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(500),
    `reset_at` TIMESTAMP(6) NULL,
    `user_id` VARCHAR(36),
    `team_id` VARCHAR(36),
    `created_by` VARCHAR(36),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    `replay_enabled` TINYINT(1) DEFAULT 0,
    `replay_config` JSON,
    PRIMARY KEY (`website_id`),
    INDEX `idx_website_user_id` (`user_id`),
    INDEX `idx_website_team_id` (`team_id`),
    INDEX `idx_website_created_at` (`created_at`),
    INDEX `idx_website_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Website event table (main analytics table - optimized for column store)
CREATE TABLE IF NOT EXISTS `website_event` (
    `event_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `visit_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `url_path` VARCHAR(500),
    `url_query` VARCHAR(500),
    `utm_source` VARCHAR(255),
    `utm_medium` VARCHAR(255),
    `utm_campaign` VARCHAR(255),
    `utm_content` VARCHAR(255),
    `utm_term` VARCHAR(255),
    `referrer_path` VARCHAR(500),
    `referrer_query` VARCHAR(500),
    `referrer_domain` VARCHAR(500),
    `page_title` VARCHAR(500),
    `gclid` VARCHAR(255),
    `fbclid` VARCHAR(255),
    `msclkid` VARCHAR(255),
    `ttclid` VARCHAR(255),
    `li_fat_id` VARCHAR(255),
    `twclid` VARCHAR(255),
    `event_type` INT DEFAULT 1,
    `event_name` VARCHAR(50),
    `tag` VARCHAR(50),
    `hostname` VARCHAR(100),
    `lcp` DECIMAL(10, 1),
    `inp` DECIMAL(10, 1),
    `cls` DECIMAL(10, 4),
    `fcp` DECIMAL(10, 1),
    `ttfb` DECIMAL(10, 1),
    PRIMARY KEY (`event_id`),
    INDEX `idx_event_created_at` (`created_at`),
    INDEX `idx_event_session_id` (`session_id`),
    INDEX `idx_event_visit_id` (`visit_id`),
    INDEX `idx_event_website_id` (`website_id`),
    INDEX `idx_event_website_created` (`website_id`, `created_at`),
    INDEX `idx_event_website_created_url_path` (`website_id`, `created_at`, `url_path`(191)),
    INDEX `idx_event_website_created_url_query` (`website_id`, `created_at`, `url_query`(191)),
    INDEX `idx_event_website_created_referrer_domain` (`website_id`, `created_at`, `referrer_domain`(191)),
    INDEX `idx_event_website_created_page_title` (`website_id`, `created_at`, `page_title`(191)),
    INDEX `idx_event_website_created_event_name` (`website_id`, `created_at`, `event_name`),
    INDEX `idx_event_website_created_tag` (`website_id`, `created_at`, `tag`),
    INDEX `idx_event_website_session_created` (`website_id`, `session_id`, `created_at`),
    INDEX `idx_event_website_visit_created` (`website_id`, `visit_id`, `created_at`),
    INDEX `idx_event_website_created_hostname` (`website_id`, `created_at`, `hostname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
-- For OceanBase 4.3+, you can enable column store with:
-- WITH (COLUMN_GROUP = 'column_store')
-- Or use row-column hybrid store with:
-- WITH (COLUMN_GROUP = 'row_column_store')
;

-- Event data table
CREATE TABLE IF NOT EXISTS `event_data` (
    `event_data_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `website_event_id` VARCHAR(36) NOT NULL,
    `data_key` VARCHAR(500),
    `string_value` VARCHAR(500),
    `number_value` DECIMAL(19, 4),
    `date_value` TIMESTAMP(6) NULL,
    `data_type` INT,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`event_data_id`),
    INDEX `idx_event_data_created_at` (`created_at`),
    INDEX `idx_event_data_website_id` (`website_id`),
    INDEX `idx_event_data_website_event_id` (`website_event_id`),
    INDEX `idx_event_data_website_created` (`website_id`, `created_at`),
    INDEX `idx_event_data_website_created_data_key` (`website_id`, `created_at`, `data_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session data table
CREATE TABLE IF NOT EXISTS `session_data` (
    `session_data_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `data_key` VARCHAR(500),
    `string_value` VARCHAR(500),
    `number_value` DECIMAL(19, 4),
    `date_value` TIMESTAMP(6) NULL,
    `data_type` INT,
    `distinct_id` VARCHAR(50),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`session_data_id`),
    INDEX `idx_session_data_created_at` (`created_at`),
    INDEX `idx_session_data_website_id` (`website_id`),
    INDEX `idx_session_data_session_id` (`session_id`),
    INDEX `idx_session_data_session_created` (`session_id`, `created_at`),
    INDEX `idx_session_data_website_created_data_key` (`website_id`, `created_at`, `data_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Team table
CREATE TABLE IF NOT EXISTS `team` (
    `team_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `access_code` VARCHAR(50),
    `logo_url` VARCHAR(2183),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    PRIMARY KEY (`team_id`),
    UNIQUE KEY `team_access_code_key` (`access_code`),
    INDEX `idx_team_access_code` (`access_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Team user table
CREATE TABLE IF NOT EXISTS `team_user` (
    `team_user_id` VARCHAR(36) NOT NULL,
    `team_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`team_user_id`),
    INDEX `idx_team_user_team_id` (`team_id`),
    INDEX `idx_team_user_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Report table
CREATE TABLE IF NOT EXISTS `report` (
    `report_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500),
    `parameters` JSON NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`report_id`),
    INDEX `idx_report_user_id` (`user_id`),
    INDEX `idx_report_website_id` (`website_id`),
    INDEX `idx_report_type` (`type`),
    INDEX `idx_report_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Segment table
CREATE TABLE IF NOT EXISTS `segment` (
    `segment_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `parameters` JSON NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`segment_id`),
    INDEX `idx_segment_website_id` (`website_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Revenue table
CREATE TABLE IF NOT EXISTS `revenue` (
    `revenue_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `event_name` VARCHAR(50) NOT NULL,
    `currency` VARCHAR(10) NOT NULL,
    `revenue` DECIMAL(19, 4),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`revenue_id`),
    INDEX `idx_revenue_website_id` (`website_id`),
    INDEX `idx_revenue_session_id` (`session_id`),
    INDEX `idx_revenue_website_created` (`website_id`, `created_at`),
    INDEX `idx_revenue_website_session_created` (`website_id`, `session_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Link table (short links)
CREATE TABLE IF NOT EXISTS `link` (
    `link_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `user_id` VARCHAR(36),
    `team_id` VARCHAR(36),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    PRIMARY KEY (`link_id`),
    UNIQUE KEY `link_slug_key` (`slug`),
    INDEX `idx_link_slug` (`slug`),
    INDEX `idx_link_user_id` (`user_id`),
    INDEX `idx_link_team_id` (`team_id`),
    INDEX `idx_link_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pixel table (tracking pixels)
CREATE TABLE IF NOT EXISTS `pixel` (
    `pixel_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `user_id` VARCHAR(36),
    `team_id` VARCHAR(36),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    PRIMARY KEY (`pixel_id`),
    UNIQUE KEY `pixel_slug_key` (`slug`),
    INDEX `idx_pixel_slug` (`slug`),
    INDEX `idx_pixel_user_id` (`user_id`),
    INDEX `idx_pixel_team_id` (`team_id`),
    INDEX `idx_pixel_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Board table (dashboards)
CREATE TABLE IF NOT EXISTS `board` (
    `board_id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500),
    `parameters` JSON NOT NULL,
    `user_id` VARCHAR(36),
    `team_id` VARCHAR(36),
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`board_id`),
    INDEX `idx_board_user_id` (`user_id`),
    INDEX `idx_board_team_id` (`team_id`),
    INDEX `idx_board_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Share table
CREATE TABLE IF NOT EXISTS `share` (
    `share_id` VARCHAR(36) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `share_type` INT NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `parameters` JSON NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`share_id`),
    UNIQUE KEY `share_slug_key` (`slug`),
    INDEX `idx_share_entity_id` (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session replay table
CREATE TABLE IF NOT EXISTS `session_replay` (
    `replay_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `visit_id` VARCHAR(36) NOT NULL,
    `chunk_index` INT NOT NULL,
    `events` LONGBLOB NOT NULL,
    `event_count` INT NOT NULL,
    `started_at` TIMESTAMP(6) NOT NULL,
    `ended_at` TIMESTAMP(6) NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`replay_id`),
    INDEX `idx_replay_website_id` (`website_id`),
    INDEX `idx_replay_session_id` (`session_id`),
    INDEX `idx_replay_visit_id` (`visit_id`),
    INDEX `idx_replay_website_session` (`website_id`, `session_id`),
    INDEX `idx_replay_website_visit` (`website_id`, `visit_id`),
    INDEX `idx_replay_website_created` (`website_id`, `created_at`),
    INDEX `idx_replay_session_chunk` (`session_id`, `chunk_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session replay saved table
CREATE TABLE IF NOT EXISTS `session_replay_saved` (
    `saved_replay_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `visit_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`saved_replay_id`),
    UNIQUE KEY `session_replay_saved_unique` (`website_id`, `visit_id`),
    INDEX `idx_saved_replay_website_id` (`website_id`),
    INDEX `idx_saved_replay_visit_id` (`visit_id`),
    INDEX `idx_saved_replay_website_created` (`website_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraints
ALTER TABLE `session` ADD CONSTRAINT `fk_session_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `website` ADD CONSTRAINT `fk_website_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL;
ALTER TABLE `website` ADD CONSTRAINT `fk_website_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON DELETE SET NULL;
ALTER TABLE `website` ADD CONSTRAINT `fk_website_created_by` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE SET NULL;
ALTER TABLE `website_event` ADD CONSTRAINT `fk_event_session` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE;
ALTER TABLE `event_data` ADD CONSTRAINT `fk_event_data_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `event_data` ADD CONSTRAINT `fk_event_data_event` FOREIGN KEY (`website_event_id`) REFERENCES `website_event`(`event_id`) ON DELETE CASCADE;
ALTER TABLE `session_data` ADD CONSTRAINT `fk_session_data_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `session_data` ADD CONSTRAINT `fk_session_data_session` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE;
ALTER TABLE `team_user` ADD CONSTRAINT `fk_team_user_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON DELETE CASCADE;
ALTER TABLE `team_user` ADD CONSTRAINT `fk_team_user_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE;
ALTER TABLE `report` ADD CONSTRAINT `fk_report_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE;
ALTER TABLE `report` ADD CONSTRAINT `fk_report_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `segment` ADD CONSTRAINT `fk_segment_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `revenue` ADD CONSTRAINT `fk_revenue_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `revenue` ADD CONSTRAINT `fk_revenue_session` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE;
ALTER TABLE `link` ADD CONSTRAINT `fk_link_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL;
ALTER TABLE `link` ADD CONSTRAINT `fk_link_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON DELETE SET NULL;
ALTER TABLE `pixel` ADD CONSTRAINT `fk_pixel_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL;
ALTER TABLE `pixel` ADD CONSTRAINT `fk_pixel_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON DELETE SET NULL;
ALTER TABLE `board` ADD CONSTRAINT `fk_board_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL;
ALTER TABLE `board` ADD CONSTRAINT `fk_board_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON DELETE SET NULL;
ALTER TABLE `session_replay` ADD CONSTRAINT `fk_replay_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;
ALTER TABLE `session_replay_saved` ADD CONSTRAINT `fk_saved_replay_website` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE;