/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `user_id` on the `account` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - The primary key for the `event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `event_id` on the `event` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `website_id` on the `event` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `session_id` on the `event` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - The primary key for the `event_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `event_data_id` on the `event_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedBigInt`.
  - You are about to alter the column `event_id` on the `event_data` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - The primary key for the `pageview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `view_id` on the `pageview` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `website_id` on the `pageview` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `session_id` on the `pageview` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `session_id` on the `session` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `website_id` on the `session` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - The primary key for the `website` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `website_id` on the `website` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.
  - You are about to alter the column `user_id` on the `website` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `UnsignedBigInt`.

*/
-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_ibfk_1`;

-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_ibfk_2`;

-- DropForeignKey
ALTER TABLE `event_data` DROP FOREIGN KEY `event_data_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `pageview` DROP FOREIGN KEY `pageview_ibfk_1`;

-- DropForeignKey
ALTER TABLE `pageview` DROP FOREIGN KEY `pageview_ibfk_2`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `session_ibfk_1`;

-- DropForeignKey
ALTER TABLE `website` DROP FOREIGN KEY `website_ibfk_1`;

-- AlterTable
ALTER TABLE `account` DROP PRIMARY KEY,
    MODIFY `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`user_id`);

-- AlterTable
ALTER TABLE `event` DROP PRIMARY KEY,
    MODIFY `event_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `website_id` BIGINT UNSIGNED NOT NULL,
    MODIFY `session_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`event_id`);

-- AlterTable
ALTER TABLE `event_data` DROP PRIMARY KEY,
    MODIFY `event_data_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `event_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`event_data_id`);

-- AlterTable
ALTER TABLE `pageview` DROP PRIMARY KEY,
    MODIFY `view_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `website_id` BIGINT UNSIGNED NOT NULL,
    MODIFY `session_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`view_id`);

-- AlterTable
ALTER TABLE `session` DROP PRIMARY KEY,
    MODIFY `session_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `website_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`session_id`);

-- AlterTable
ALTER TABLE `website` DROP PRIMARY KEY,
    MODIFY `website_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` BIGINT UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`website_id`);

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_data` ADD CONSTRAINT `event_data_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `event`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pageview` ADD CONSTRAINT `pageview_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `session`(`session_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pageview` ADD CONSTRAINT `pageview_ibfk_1` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_ibfk_1` FOREIGN KEY (`website_id`) REFERENCES `website`(`website_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `website` ADD CONSTRAINT `website_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `account`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
