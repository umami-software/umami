-- CreateTable
CREATE TABLE "share" (
    "share_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "share_type" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "parameters" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "share_pkey" PRIMARY KEY ("share_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_share_id_key" ON "share"("share_id");

-- CreateIndex
CREATE UNIQUE INDEX "share_slug_key" ON "share"("slug");

-- CreateIndex
CREATE INDEX "share_entity_id_idx" ON "share"("entity_id");

-- MigrateData
INSERT INTO "share" (share_id, entity_id, name, share_type, slug, parameters, created_at)
SELECT gen_random_uuid(),
       website_id,
       name,
       1,
       share_id,
       '{}'::jsonb,
       now()
FROM "website"
WHERE share_id IS NOT NULL;

-- DropIndex
DROP INDEX "website_share_id_idx";

-- DropIndex
DROP INDEX "website_share_id_key";

-- AlterTable
ALTER TABLE "website" DROP COLUMN "share_id";
