-- CreateTable
CREATE TABLE "alert_rule" (
    "alert_rule_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "metric" VARCHAR(50) NOT NULL,
    "threshold" DECIMAL(19,4) NOT NULL,
    "window_minutes" INTEGER NOT NULL DEFAULT 15,
    "channel_type" VARCHAR(50) NOT NULL,
    "channel_config" JSONB NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "alert_rule_pkey" PRIMARY KEY ("alert_rule_id")
);

-- CreateTable
CREATE TABLE "alert_notification" (
    "notification_id" UUID NOT NULL,
    "alert_rule_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" VARCHAR(2000) NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "alert_rule_website_id_idx" ON "alert_rule"("website_id");

-- CreateIndex
CREATE INDEX "alert_rule_website_id_is_enabled_idx" ON "alert_rule"("website_id", "is_enabled");

-- CreateIndex
CREATE INDEX "alert_notification_website_id_created_at_idx" ON "alert_notification"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "alert_notification_alert_rule_id_created_at_idx" ON "alert_notification"("alert_rule_id", "created_at");
