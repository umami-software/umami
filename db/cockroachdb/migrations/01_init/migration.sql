CREATE SEQUENCE IF NOT EXISTS acct_seq;
CREATE SEQUENCE IF NOT EXISTS event_seq;
CREATE SEQUENCE IF NOT EXISTS view_seq;
CREATE SEQUENCE IF NOT EXISTS ses_seq;
CREATE SEQUENCE IF NOT EXISTS web_seq;

-- CreateTable
CREATE TABLE "account" (
    "user_id" INT8 NOT NULL DEFAULT nextval('acct_seq'),
    "username" STRING(255) NOT NULL,
    "password" STRING(60) NOT NULL,
    "is_admin" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" INT8 NOT NULL DEFAULT nextval('event_seq'),
    "website_id" INT8 NOT NULL,
    "session_id" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" STRING(500) NOT NULL,
    "event_type" STRING(50) NOT NULL,
    "event_value" STRING(50) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "pageview" (
    "view_id" INT8 NOT NULL DEFAULT nextval('view_seq'),
    "website_id" INT8 NOT NULL,
    "session_id" INT8 NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" STRING(500) NOT NULL,
    "referrer" STRING(500),

    CONSTRAINT "pageview_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" INT8 NOT NULL DEFAULT nextval('ses_seq'),
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
    "website_id" INT8 NOT NULL DEFAULT nextval('web_seq'),
    "website_uuid" UUID NOT NULL,
    "user_id" INT8 NOT NULL,
    "name" STRING(100) NOT NULL,
    "domain" STRING(500),
    "share_id" STRING(64),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_pkey" PRIMARY KEY ("website_id")
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

-- AddForeignKey
ALTER TABLE "event" ADD FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateAdminUser
INSERT INTO account (username, password, is_admin) values ('admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa', true);
