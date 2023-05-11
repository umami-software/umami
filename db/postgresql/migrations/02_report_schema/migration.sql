-- CreateTable
CREATE TABLE "user_report" (
    "report_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "report_name" VARCHAR(200) NOT NULL,
    "template_name" VARCHAR(200) NOT NULL,
    "parameters" VARCHAR(6000) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_report_pkey" PRIMARY KEY ("report_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_report_report_id_key" ON "user_report"("report_id");

-- CreateIndex
CREATE INDEX "user_report_user_id_idx" ON "user_report"("user_id");
