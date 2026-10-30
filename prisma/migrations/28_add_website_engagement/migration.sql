-- CreateTable
CREATE TABLE "website_engagement" (
    "engagement_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "url_path" VARCHAR(500) NOT NULL,
    "engagement_time" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_engagement_pkey" PRIMARY KEY ("engagement_id")
);

-- CreateIndex
CREATE INDEX "website_engagement_website_id_created_at_idx" ON "website_engagement"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "website_engagement_visit_id_idx" ON "website_engagement"("visit_id");
