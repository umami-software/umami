-- CreateTable
CREATE TABLE `segment` (
    `segment_id` VARCHAR(36) NOT NULL,
    `website_id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(200) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `parameters` JSON NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `segment_segment_id_key`(`segment_id`),
    INDEX `segment_website_id_idx`(`website_id`),
    PRIMARY KEY (`segment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
