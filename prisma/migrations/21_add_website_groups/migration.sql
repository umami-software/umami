-- CreateTable
CREATE TABLE "website_group" (
    "group_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" UUID,
    "user_id" UUID,
    "team_id" UUID,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "website_group_pkey" PRIMARY KEY ("group_id")
);

-- AlterTable
ALTER TABLE "website" ADD COLUMN "group_id" UUID;

-- CreateIndex
CREATE INDEX "website_group_user_id_idx" ON "website_group"("user_id");

-- CreateIndex
CREATE INDEX "website_group_team_id_idx" ON "website_group"("team_id");

-- CreateIndex
CREATE INDEX "website_group_parent_id_idx" ON "website_group"("parent_id");

-- CreateIndex
CREATE INDEX "website_group_created_at_idx" ON "website_group"("created_at");

-- CreateIndex
CREATE INDEX "website_group_id_idx" ON "website"("group_id");
