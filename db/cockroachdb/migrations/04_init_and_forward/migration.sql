-- CreateTable
CREATE TABLE "account" (
    "user_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "username" STRING(255) NOT NULL,
    "password" STRING(60) NOT NULL,
    "is_admin" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "account_uuid" UUID NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "website_id" INT8 NOT NULL,
    "session_id" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" STRING(500) NOT NULL,
    "event_name" STRING(50) NOT NULL,
    "event_uuid" UUID NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "event_data" (
    "event_data_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "event_id" INT8 NOT NULL,
    "event_data" JSONB NOT NULL,

    CONSTRAINT "event_data_pkey" PRIMARY KEY ("event_data_id")
);

-- CreateTable
CREATE TABLE "pageview" (
    "view_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "website_id" INT8 NOT NULL,
    "session_id" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" STRING(500) NOT NULL,
    "referrer" STRING(500),

    CONSTRAINT "pageview_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "session_uuid" UUID NOT NULL,
    "website_id" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "hostname" STRING(100),
    "browser" STRING(20),
    "os" STRING(20),
    "device" STRING(20),
    "screen" STRING(11),
    "language" STRING(35),
    "country" CHAR(2),

    CONSTRAINT "session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "website" (
    "website_id" INT8 NOT NULL DEFAULT unique_rowid(),
    "website_uuid" UUID NOT NULL,
    "user_id" INT8 NOT NULL,
    "name" STRING(100) NOT NULL,
    "domain" STRING(500),
    "share_id" STRING(64),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_pkey" PRIMARY KEY ("website_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_account_uuid_key" ON "account"("account_uuid");

-- CreateIndex
CREATE INDEX "account_account_uuid_idx" ON "account"("account_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "event_event_uuid_key" ON "event"("event_uuid");

-- CreateIndex
CREATE INDEX "event_created_at_idx" ON "event"("created_at");

-- CreateIndex
CREATE INDEX "event_session_id_idx" ON "event"("session_id");

-- CreateIndex
CREATE INDEX "event_website_id_idx" ON "event"("website_id");

-- CreateIndex
CREATE INDEX "event_event_uuid_idx" ON "event"("event_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "event_data_event_id_key" ON "event_data"("event_id");

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
CREATE UNIQUE INDEX "session_session_uuid_key" ON "session"("session_uuid");

-- CreateIndex
CREATE INDEX "session_created_at_idx" ON "session"("created_at");

-- CreateIndex
CREATE INDEX "session_website_id_idx" ON "session"("website_id");

-- CreateIndex
CREATE INDEX "session_session_uuid_idx" ON "session"("session_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "website_website_uuid_key" ON "website"("website_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "website_share_id_key" ON "website"("share_id");

-- CreateIndex
CREATE INDEX "website_user_id_idx" ON "website"("user_id");

-- CreateIndex
CREATE INDEX "website_website_uuid_idx" ON "website"("website_uuid");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_data" ADD CONSTRAINT "event_data_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateAdminUser
INSERT INTO account (username, password, is_admin, account_uuid) values ('admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa', true, gen_random_uuid());
