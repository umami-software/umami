-- AlterTable
ALTER TABLE `event_data` CHANGE `event_data_type` `data_type` INTEGER UNSIGNED NOT NULL;
ALTER TABLE `event_data` CHANGE `event_date_value` `date_value` TIMESTAMP(0) NULL;
ALTER TABLE `event_data` CHANGE `event_id` `event_data_id` VARCHAR(36) NOT NULL;
ALTER TABLE `event_data` CHANGE `event_numeric_value` `number_value` DECIMAL(19,4) NULL;
ALTER TABLE `event_data` CHANGE `event_string_value` `string_value` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `session_data` (
    `session_data_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `event_key` VARCHAR(500) NOT NULL,
    `string_value` VARCHAR(500) NULL,
    `number_value` DECIMAL(19, 4) NULL,
    `date_value` TIMESTAMP(0) NULL,
    `data_type` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `session_data_created_at_idx`(`created_at`),
    INDEX `session_data_website_id_idx`(`website_id`),
    INDEX `session_data_session_id_idx`(`session_id`),
    PRIMARY KEY (`session_data_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report` (
    `report_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(200) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `parameters` VARCHAR(6000) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `report_report_id_key`(`report_id`),
    INDEX `report_user_id_idx`(`user_id`),
    INDEX `report_website_id_idx`(`website_id`),
    INDEX `report_type_idx`(`type`),
    INDEX `report_name_idx`(`name`),
    PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- EventData migration
UPDATE event_data
SET string_value = number_value
WHERE data_type = 2;

UPDATE event_data
SET string_value = CONCAT(REPLACE(DATE_FORMAT(date_value, '%Y-%m-%d %T'), ' ', 'T'), 'Z')
WHERE data_type = 4;
