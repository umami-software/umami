-- DropTable
DROP TABLE "event";

-- CreateTable
CREATE TABLE "event" (
    "event_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),
    "url" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,

    PRIMARY KEY ("event_id"),
    
    CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "event_created_at_idx" ON "event"("created_at");

-- CreateIndex
CREATE INDEX "event_session_id_idx" ON "event"("session_id");

-- CreateIndex
CREATE INDEX "event_website_id_idx" ON "event"("website_id");

-- CreateTable
CREATE TABLE "event_data" (
    "event_data_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "event_data" TEXT NOT NULL,

    CONSTRAINT "event_data_pkey" PRIMARY KEY ("event_data_id"),
    CONSTRAINT "event_data_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "event_data_event_id_key" ON "event_data"("event_id");

-- RenameIndex
DROP INDEX "account.username_unique";
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- RenameIndex
DROP INDEX "session.session_uuid_unique";
CREATE UNIQUE INDEX "session_session_uuid_key" ON "session"("session_uuid");

-- RenameIndex
DROP INDEX "website.share_id_unique";
CREATE UNIQUE INDEX "website_share_id_key" ON "website"("share_id");

-- RenameIndex
DROP INDEX "website.website_uuid_unique";
CREATE UNIQUE INDEX "website_website_uuid_key" ON "website"("website_uuid");