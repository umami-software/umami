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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
