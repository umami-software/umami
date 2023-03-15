/*
  Warnings:

  - You are about to drop the column `user_id` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `team_website` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "team_user_id_idx";

-- DropIndex
DROP INDEX "team_website_user_id_idx";

-- AlterTable
ALTER TABLE "team" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "team_website" DROP COLUMN "user_id";