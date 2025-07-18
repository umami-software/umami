-- CreateTable
CREATE TABLE `revenue` (
    `revenue_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `event_name` VARCHAR(50) NOT NULL,
    `currency` VARCHAR(100) NOT NULL,
    `revenue` DECIMAL(19, 4) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `revenue_revenue_id_key`(`revenue_id`),
    INDEX `revenue_website_id_idx`(`website_id`),
    INDEX `revenue_session_id_idx`(`session_id`),
    INDEX `revenue_website_id_created_at_idx`(`website_id`, `created_at`),
    INDEX `revenue_website_id_session_id_created_at_idx`(`website_id`, `session_id`, `created_at`),
    PRIMARY KEY (`revenue_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
