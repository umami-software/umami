-- CreateTable
CREATE TABLE "website_filter_rule" (
    "rule_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "action" VARCHAR(50) NOT NULL DEFAULT 'exclude',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "website_filter_rule_pkey" PRIMARY KEY ("rule_id")
);

-- CreateIndex
CREATE INDEX "website_filter_rule_website_id_idx" ON "website_filter_rule"("website_id");

-- CreateIndex
CREATE INDEX "website_filter_rule_website_id_is_enabled_idx" ON "website_filter_rule"("website_id", "is_enabled");
