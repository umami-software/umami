-- CreateTable
CREATE TABLE "session_replay_view" (
    "user_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_replay_view_pkey" PRIMARY KEY ("user_id", "website_id", "visit_id")
);

-- CreateIndex
CREATE INDEX "session_replay_view_website_id_idx" ON "session_replay_view"("website_id");
