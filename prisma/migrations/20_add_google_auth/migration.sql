-- CreateTable
CREATE TABLE "website_google_auth" (
    "google_auth_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "property_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "website_google_auth_pkey" PRIMARY KEY ("google_auth_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_google_auth_website_id_key" ON "website_google_auth"("website_id");
