-- CreateTable
CREATE TABLE "payment_provider_invoice" (
    "line_id" VARCHAR(255) NOT NULL,
    "payment_provider_id" UUID NOT NULL,
    "invoice_id" VARCHAR(255) NOT NULL,
    "customer_id" VARCHAR(255) NOT NULL,
    "invoice_status" VARCHAR(50) NOT NULL,
    "invoice_period_end" TIMESTAMPTZ(6) NOT NULL,
    "usage_type" VARCHAR(20) NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "period_start" TIMESTAMPTZ(6) NOT NULL,
    "period_end" TIMESTAMPTZ(6) NOT NULL,
    "period_months" INTEGER NOT NULL,
    "mrr_cents" INTEGER NOT NULL,

    CONSTRAINT "payment_provider_invoice_pkey" PRIMARY KEY ("line_id")
);

-- CreateTable
CREATE TABLE "payment_provider" (
    "payment_provider_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "team_id" UUID,
    "api_key" TEXT NOT NULL,
    "sync_cursor" VARCHAR(255),
    "sync_status" VARCHAR(20) NOT NULL DEFAULT 'idle',
    "last_run_at" TIMESTAMPTZ(6),
    "webhook_id" VARCHAR(255),
    "webhook_secret" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "payment_provider_pkey" PRIMARY KEY ("payment_provider_id")
);

-- CreateIndex
CREATE INDEX "payment_provider_invoice_payment_provider_id_idx" ON "payment_provider_invoice"("payment_provider_id");

-- CreateIndex
CREATE INDEX "payment_provider_invoice_invoice_id_idx" ON "payment_provider_invoice"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_provider_invoice_customer_id_idx" ON "payment_provider_invoice"("customer_id");

-- CreateIndex
CREATE INDEX "payment_provider_invoice_invoice_status_idx" ON "payment_provider_invoice"("invoice_status");

-- CreateIndex
CREATE INDEX "payment_provider_invoice_usage_type_idx" ON "payment_provider_invoice"("usage_type");

-- CreateIndex
CREATE INDEX "payment_provider_user_id_idx" ON "payment_provider"("user_id");

-- CreateIndex
CREATE INDEX "payment_provider_team_id_idx" ON "payment_provider"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_name_user_id_key" ON "payment_provider"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_name_team_id_key" ON "payment_provider"("name", "team_id");
