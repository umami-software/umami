-- DropIndex
DROP INDEX IF EXISTS "event_data_website_id_created_at_event_key_idx";

-- AlterTable
ALTER TABLE "event_data" RENAME COLUMN "event_key" TO "data_key";

-- AlterTable
ALTER TABLE "session_data" DROP COLUMN "deleted_at";
ALTER TABLE "session_data" RENAME COLUMN "session_key" TO "data_key";

-- CreateIndex
CREATE INDEX "event_data_website_id_created_at_data_key_idx" ON "event_data"("website_id", "created_at", "data_key");

-- CreateIndex
CREATE INDEX "session_data_session_id_created_at_idx" ON "session_data"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "session_data_website_id_created_at_data_key_idx" ON "session_data"("website_id", "created_at", "data_key");
