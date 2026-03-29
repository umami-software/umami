-- CreateTable
CREATE TABLE IF NOT EXISTS "website_google_auth" (
    "google_auth_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "property_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "website_google_auth_pkey" PRIMARY KEY ("google_auth_id"),
    CONSTRAINT "website_google_auth_website_id_key" UNIQUE ("website_id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "website_google_auth_website_id_idx" ON "website_google_auth"("website_id");
