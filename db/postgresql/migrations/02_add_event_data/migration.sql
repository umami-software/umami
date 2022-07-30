-- AlterTable
ALTER TABLE event RENAME TO event_old;

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
ALTER INDEX "account.username_unique" RENAME TO "account_username_key";

-- RenameIndex
ALTER INDEX "session.session_uuid_unique" RENAME TO "session_session_uuid_key";

-- RenameIndex
ALTER INDEX "website.share_id_unique" RENAME TO "website_share_id_key";

-- RenameIndex
ALTER INDEX "website.website_uuid_unique" RENAME TO "website_website_uuid_key";

/*
  Warnings:

  - You are about to drop the column `event_type` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `event_value` on the `event` table. All the data in the column will be lost.

*/
-- Populate event_name
update event
set "event_name" = event.event_value;

-- Set event_name not null
ALTER TABLE "event" ALTER COLUMN "event_name" SET NOT NULL;

-- Drop old columns
ALTER TABLE "event" DROP COLUMN "event_type",
DROP COLUMN "event_value";
