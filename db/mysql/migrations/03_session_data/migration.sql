/*
  Warnings:

  - The primary key for the `event_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_data_type` on the `event_data` table. All the data in the column will be lost.
  - You are about to drop the column `event_date_value` on the `event_data` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `event_data` table. All the data in the column will be lost.
  - You are about to drop the column `event_numeric_value` on the `event_data` table. All the data in the column will be lost.
  - You are about to drop the column `event_string_value` on the `event_data` table. All the data in the column will be lost.
  - Added the required column `data_type` to the `event_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_data_id` to the `event_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event_data` RENAME COLUMN `event_data_type` TO `data_type`;
ALTER TABLE `event_data` RENAME COLUMN `event_date_value` TO `date_value`;
ALTER TABLE `event_data` RENAME COLUMN `event_id` TO `event_data_id`;
ALTER TABLE `event_data` RENAME COLUMN `event_numeric_value` TO `number_value`;
ALTER TABLE `event_data` RENAME COLUMN `event_string_value` TO `string_value`;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
