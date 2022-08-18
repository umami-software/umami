-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_session_id_fkey";
ALTER TABLE "event" DROP CONSTRAINT "event_website_id_fkey";

-- RenameIndex
ALTER INDEX "event_pkey" RENAME TO "event_old_pkey";
ALTER INDEX "event_created_at_idx" RENAME TO "event_old_created_at_idx";
ALTER INDEX "event_session_id_idx" RENAME TO "event_old_session_id_idx";
ALTER INDEX "event_website_id_idx" RENAME TO "event_old_website_id_idx";

-- RenameTable
ALTER TABLE "event" RENAME TO "_event_old";

-- CreateTable
CREATE TABLE "event" (
    "event_id" SERIAL NOT NULL,
    "website_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" VARCHAR(500) NOT NULL,
    "event_name" VARCHAR(50) NOT NULL,

    PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "event_created_at_idx" ON "event"("created_at");

-- CreateIndex
CREATE INDEX "event_session_id_idx" ON "event"("session_id");

-- CreateIndex
CREATE INDEX "event_website_id_idx" ON "event"("website_id");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "event_data" (
    "event_data_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "event_data" JSONB NOT NULL,

    CONSTRAINT "event_data_pkey" PRIMARY KEY ("event_data_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_data_event_id_key" ON "event_data"("event_id");

-- AddForeignKey
ALTER TABLE "event_data" ADD CONSTRAINT "event_data_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX IF EXISTS "account.username_unique" RENAME TO "account_username_key";

-- RenameIndex
ALTER INDEX IF EXISTS "session.session_uuid_unique" RENAME TO "session_session_uuid_key";

-- RenameIndex
ALTER INDEX IF EXISTS "website.share_id_unique" RENAME TO "website_share_id_key";

-- RenameIndex
ALTER INDEX IF EXISTS "website.website_uuid_unique" RENAME TO "website_website_uuid_key";