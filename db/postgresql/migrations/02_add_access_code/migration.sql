/*
  Warnings:

  - You are about to alter the column `share_id` on the `website` table. The data in that column could be lost. The data in that column will be cast from `VarChar(64)` to `VarChar(50)`.
  - A unique constraint covering the columns `[access_code]` on the table `team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "team" ADD COLUMN     "access_code" VARCHAR(50);

-- AlterTable
ALTER TABLE "website" ALTER COLUMN "share_id" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "team_access_code_key" ON "team"("access_code");

-- CreateIndex
CREATE INDEX "team_user_id_idx" ON "team"("user_id");

-- CreateIndex
CREATE INDEX "team_access_code_idx" ON "team"("access_code");

-- CreateIndex
CREATE INDEX "team_user_team_id_idx" ON "team_user"("team_id");

-- CreateIndex
CREATE INDEX "team_user_user_id_idx" ON "team_user"("user_id");
