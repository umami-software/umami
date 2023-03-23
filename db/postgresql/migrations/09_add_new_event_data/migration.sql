-- CreateTable
CREATE TABLE "event_data" (
    "event_id" UUID NOT NULL,
    "website_event_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "url_path" VARCHAR(500) NOT NULL,
    "event_name" VARCHAR(500) NOT NULL,
    "event_key" VARCHAR(500) NOT NULL,
    "event_string_value" VARCHAR(500) NOT NULL,
    "event_numeric_value" DECIMAL(19,4) NOT NULL,
    "event_date_value" TIMESTAMPTZ(6),
    "event_data_type" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_data_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "event_data_created_at_idx" ON "event_data"("created_at");

-- CreateIndex
CREATE INDEX "event_data_session_id_idx" ON "event_data"("session_id");

-- CreateIndex
CREATE INDEX "event_data_website_id_idx" ON "event_data"("website_id");

-- CreateIndex
CREATE INDEX "event_data_website_event_id_idx" ON "event_data"("website_event_id");

-- CreateIndex
CREATE INDEX "event_data_website_id_website_event_id_created_at_idx" ON "event_data"("website_id", "website_event_id", "created_at");

-- CreateIndex
CREATE INDEX "event_data_website_id_session_id_created_at_idx" ON "event_data"("website_id", "session_id", "created_at");

-- CreateIndex
CREATE INDEX "event_data_website_id_session_id_website_event_id_created_a_idx" ON "event_data"("website_id", "session_id", "website_event_id", "created_at");
