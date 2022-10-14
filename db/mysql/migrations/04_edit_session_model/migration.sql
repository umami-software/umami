/*
 Warnings:
 
 - The primary key for the `event_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
 - You are about to alter the column `event_data_id` on the `event_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
 - You are about to drop the `_event_old` table. If the table is not empty, all the data it contains will be lost.
 
 */
-- DropForeignKey
ALTER TABLE
  `event` DROP FOREIGN KEY `event_session_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `event` DROP FOREIGN KEY `event_website_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `event_data` DROP FOREIGN KEY `event_data_event_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `pageview` DROP FOREIGN KEY `pageview_session_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `pageview` DROP FOREIGN KEY `pageview_website_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `session` DROP FOREIGN KEY `session_website_id_fkey`;

-- DropForeignKey
ALTER TABLE
  `website` DROP FOREIGN KEY `website_user_id_fkey`;

-- AlterTable
ALTER TABLE
  `event_data` DROP PRIMARY KEY,
MODIFY
  `event_data_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
ADD
  PRIMARY KEY (`event_data_id`);

-- AlterTable
ALTER TABLE
  `session`
ADD
  COLUMN `ip` VARCHAR(255) NULL,
ADD
  COLUMN `user_agent` TEXT NULL;

-- DropTable
DROP TABLE `_event_old`;