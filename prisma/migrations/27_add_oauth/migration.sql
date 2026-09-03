-- CreateTable
CREATE TABLE "oauth_client" (
    "oauth_client_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "redirect_uris" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_client_pkey" PRIMARY KEY ("oauth_client_id")
);

-- CreateTable
CREATE TABLE "oauth_authorization_code" (
    "oauth_code_id" UUID NOT NULL,
    "code_hash" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "client_id" VARCHAR(2048) NOT NULL,
    "redirect_uri" VARCHAR(2048) NOT NULL,
    "scope" VARCHAR(500) NOT NULL,
    "resource" VARCHAR(2048),
    "code_challenge" VARCHAR(128) NOT NULL,
    "code_challenge_method" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_authorization_code_pkey" PRIMARY KEY ("oauth_code_id")
);

-- CreateTable
CREATE TABLE "oauth_refresh_token" (
    "oauth_refresh_token_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "client_id" VARCHAR(2048) NOT NULL,
    "scope" VARCHAR(500) NOT NULL,
    "resource" VARCHAR(2048),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_refresh_token_pkey" PRIMARY KEY ("oauth_refresh_token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_authorization_code_code_hash_key" ON "oauth_authorization_code"("code_hash");

-- CreateIndex
CREATE INDEX "oauth_authorization_code_user_id_idx" ON "oauth_authorization_code"("user_id");

-- CreateIndex
CREATE INDEX "oauth_authorization_code_expires_at_idx" ON "oauth_authorization_code"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_refresh_token_token_hash_key" ON "oauth_refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "oauth_refresh_token_user_id_idx" ON "oauth_refresh_token"("user_id");

-- CreateIndex
CREATE INDEX "oauth_refresh_token_client_id_idx" ON "oauth_refresh_token"("client_id");

-- AddForeignKey
ALTER TABLE "oauth_authorization_code" ADD CONSTRAINT "oauth_authorization_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
