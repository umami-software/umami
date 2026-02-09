-- CreateTable
CREATE TABLE "performance" (
    "performance_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "url_path" VARCHAR(500) NOT NULL,
    "lcp" DECIMAL(10,1),
    "inp" DECIMAL(10,1),
    "cls" DECIMAL(10,4),
    "fcp" DECIMAL(10,1),
    "ttfb" DECIMAL(10,1),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_pkey" PRIMARY KEY ("performance_id")
);

-- CreateIndex
CREATE INDEX "performance_website_id_idx" ON "performance"("website_id");

-- CreateIndex
CREATE INDEX "performance_session_id_idx" ON "performance"("session_id");

-- CreateIndex
CREATE INDEX "performance_website_id_created_at_idx" ON "performance"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "performance_website_id_url_path_created_at_idx" ON "performance"("website_id", "url_path", "created_at");
