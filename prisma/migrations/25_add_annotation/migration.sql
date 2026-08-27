-- CreateTable
CREATE TABLE "annotation" (
    "annotation_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "user_id" UUID,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT true,
    "note" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "annotation_pkey" PRIMARY KEY ("annotation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "annotation_annotation_id_key" ON "annotation"("annotation_id");

-- CreateIndex
CREATE INDEX "annotation_website_id_date_idx" ON "annotation"("website_id", "date");
