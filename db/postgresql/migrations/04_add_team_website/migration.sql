/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `team_user` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `website` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "website_team_id_idx";

-- AlterTable
ALTER TABLE "team" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "team_user" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "website" DROP COLUMN "team_id";

-- CreateTable
CREATE TABLE "team_website" (
    "team_website_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_website_pkey" PRIMARY KEY ("team_website_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_website_team_website_id_key" ON "team_website"("team_website_id");

-- CreateIndex
CREATE INDEX "team_website_team_id_idx" ON "team_website"("team_id");

-- CreateIndex
CREATE INDEX "team_website_user_id_idx" ON "team_website"("user_id");

-- CreateIndex
CREATE INDEX "team_website_website_id_idx" ON "team_website"("website_id");
