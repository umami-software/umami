ALTER TABLE "website" RENAME COLUMN "replay_enabled" TO "recorder_enabled";

UPDATE "website"
SET "replay_config" = COALESCE("replay_config", '{}'::jsonb) || '{"replayEnabled": true}'::jsonb
WHERE "recorder_enabled" = true;

-- CreateTable
CREATE TABLE "heatmap_event" (
    "heatmap_event_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "url_path" VARCHAR(500) NOT NULL,
    "event_type" INTEGER NOT NULL,
    "node_id" INTEGER,
    "x" INTEGER,
    "y" INTEGER,
    "page_x" INTEGER,
    "page_y" INTEGER,
    "page_w" INTEGER,
    "viewport_w" INTEGER,
    "viewport_h" INTEGER,
    "page_h" INTEGER,
    "scroll_pct" INTEGER,
    "replay_chunk_index" INTEGER,
    "replay_event_index" INTEGER,
    "replay_time_ms" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heatmap_event_pkey" PRIMARY KEY ("heatmap_event_id")
);

-- CreateIndex
CREATE INDEX "heatmap_event_website_id_idx" ON "heatmap_event"("website_id");
CREATE INDEX "heatmap_event_visit_id_idx" ON "heatmap_event"("visit_id");
CREATE INDEX "heatmap_event_website_id_created_at_idx" ON "heatmap_event"("website_id", "created_at");
CREATE INDEX "heatmap_event_website_id_url_path_event_type_created_at_idx" ON "heatmap_event"("website_id", "url_path", "event_type", "created_at");
CREATE INDEX "heatmap_event_website_id_visit_id_replay_chunk_index_replay_event_index_idx" ON "heatmap_event"("website_id", "visit_id", "replay_chunk_index", "replay_event_index");

-- CreateTable
CREATE TABLE "heatmap_snapshot" (
    "snapshot_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "url_path" VARCHAR(500) NOT NULL,
    "viewport_w" INTEGER NOT NULL,
    "viewport_h" INTEGER NOT NULL,
    "page_w" INTEGER NOT NULL,
    "page_h" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "mime_type" VARCHAR(100),
    "image_data" BYTEA,
    "image_size" INTEGER,
    "error" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "heatmap_snapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "heatmap_snapshot_website_id_url_path_viewport_w_viewport_h_key"
ON "heatmap_snapshot"("website_id", "url_path", "viewport_w", "viewport_h");
CREATE INDEX "heatmap_snapshot_website_id_idx" ON "heatmap_snapshot"("website_id");
CREATE INDEX "heatmap_snapshot_website_id_url_path_idx" ON "heatmap_snapshot"("website_id", "url_path");
CREATE INDEX "heatmap_snapshot_website_id_updated_at_idx" ON "heatmap_snapshot"("website_id", "updated_at");
