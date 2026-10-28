-- CreateTable (additive)
CREATE TABLE "marketing_widget" (
    "widget_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "delivery" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "marketing_widget_pkey" PRIMARY KEY ("widget_id")
);

CREATE TABLE "lead" (
    "lead_id" UUID NOT NULL,
    "widget_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "page_url" VARCHAR(500),
    "delivery_status" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("lead_id")
);

CREATE INDEX "marketing_widget_website_id_idx" ON "marketing_widget"("website_id");
CREATE INDEX "lead_website_id_created_at_idx" ON "lead"("website_id", "created_at");
CREATE INDEX "lead_widget_id_idx" ON "lead"("widget_id");

ALTER TABLE "marketing_widget" ADD CONSTRAINT "marketing_widget_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead" ADD CONSTRAINT "lead_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "marketing_widget"("widget_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead" ADD CONSTRAINT "lead_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;
