-- CreateTable
CREATE TABLE "account" (
    "user_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_admin" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),
    "updated_at" DATETIME DEFAULT (strftime('%s000', 'now')),

    PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),
    "url" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_value" TEXT NOT NULL,

    PRIMARY KEY ("event_id"),
    FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pageview" (
    "view_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),
    "url" TEXT NOT NULL,
    "referrer" TEXT,

    PRIMARY KEY ("view_id"),
    FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" INTEGER NOT NULL,
    "session_uuid" TEXT NOT NULL,
    "website_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),
    "hostname" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "screen" TEXT,
    "language" TEXT,
    "country" TEXT,

    PRIMARY KEY ("session_id"),
    FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website" (
    "website_id" INTEGER NOT NULL,
    "website_uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "share_id" TEXT,
    "created_at" DATETIME DEFAULT (strftime('%s000', 'now')),

    PRIMARY KEY ("website_id"),
    FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "account.username_unique" ON "account"("username");

-- CreateIndex
CREATE INDEX "event_created_at_idx" ON "event"("created_at");

-- CreateIndex
CREATE INDEX "event_session_id_idx" ON "event"("session_id");

-- CreateIndex
CREATE INDEX "event_website_id_idx" ON "event"("website_id");

-- CreateIndex
CREATE INDEX "pageview_created_at_idx" ON "pageview"("created_at");

-- CreateIndex
CREATE INDEX "pageview_session_id_idx" ON "pageview"("session_id");

-- CreateIndex
CREATE INDEX "pageview_website_id_created_at_idx" ON "pageview"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "pageview_website_id_idx" ON "pageview"("website_id");

-- CreateIndex
CREATE INDEX "pageview_website_id_session_id_created_at_idx" ON "pageview"("website_id", "session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "session.session_uuid_unique" ON "session"("session_uuid");

-- CreateIndex
CREATE INDEX "session_created_at_idx" ON "session"("created_at");

-- CreateIndex
CREATE INDEX "session_website_id_idx" ON "session"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX "website.website_uuid_unique" ON "website"("website_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "website.share_id_unique" ON "website"("share_id");

-- CreateIndex
CREATE INDEX "website_user_id_idx" ON "website"("user_id");

-- CreateAdminUser
INSERT INTO account (username, password, is_admin) values ('admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa', true);
