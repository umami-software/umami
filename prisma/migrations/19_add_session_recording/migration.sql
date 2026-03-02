-- AlterTable
ALTER TABLE "website" ADD COLUMN "replay_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "website" ADD COLUMN "replay_config" JSONB;

-- CreateTable
CREATE TABLE "session_replay" (
    "replay_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "events" BYTEA NOT NULL,
    "event_count" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_replay_pkey" PRIMARY KEY ("replay_id")
);

-- CreateIndex
CREATE INDEX "session_replay_website_id_idx" ON "session_replay"("website_id");
CREATE INDEX "session_replay_session_id_idx" ON "session_replay"("session_id");
CREATE INDEX "session_replay_website_id_session_id_idx" ON "session_replay"("website_id", "session_id");
CREATE INDEX "session_replay_website_id_created_at_idx" ON "session_replay"("website_id", "created_at");
CREATE INDEX "session_replay_session_id_chunk_index_idx" ON "session_replay"("session_id", "chunk_index");
