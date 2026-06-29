-- AlterTable
ALTER TABLE "session" ADD COLUMN "visitor_id" VARCHAR(50);

-- CreateIndex
CREATE INDEX "session_website_id_visitor_id_idx" ON "session"("website_id", "visitor_id");

-- CreateTable
CREATE TABLE "identity_link" (
    "identity_link_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "visitor_id" VARCHAR(50) NOT NULL,
    "distinct_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_link_pkey" PRIMARY KEY ("identity_link_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identity_link_website_id_visitor_id_distinct_id_key" ON "identity_link"("website_id", "visitor_id", "distinct_id");
CREATE INDEX "identity_link_website_id_distinct_id_idx" ON "identity_link"("website_id", "distinct_id");
CREATE INDEX "identity_link_website_id_visitor_id_idx" ON "identity_link"("website_id", "visitor_id");
