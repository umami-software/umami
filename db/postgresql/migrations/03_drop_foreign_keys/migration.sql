-- DropForeignKey
ALTER TABLE "team_user" DROP CONSTRAINT "team_user_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_user" DROP CONSTRAINT "team_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT "website_team_id_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT "website_user_id_fkey";

-- CreateIndex
CREATE INDEX "website_team_id_idx" ON "website"("team_id");

-- CreateIndex
CREATE INDEX "website_user_id_idx" ON "website"("user_id");
