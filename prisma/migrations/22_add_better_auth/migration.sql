-- Better-auth migration: extend user table, add auth_session / account / verification tables,
-- and move bcrypt password hashes into credential provider account rows.

-- Extend user table
ALTER TABLE "user"
  ADD COLUMN "email" VARCHAR(320),
  ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "display_username" VARCHAR(255),
  ADD COLUMN "banned" BOOLEAN,
  ADD COLUMN "ban_reason" TEXT,
  ADD COLUMN "ban_expires" TIMESTAMPTZ(6);

-- Backfill: synthesize a stable placeholder email from the immutable user id,
-- preserve the original username casing as display_username, and ensure the
-- better-auth "name" field (mapped to display_name) is non-null.
UPDATE "user" SET
  "email" = "user_id"::text || '@placeholder.local',
  "display_username" = "username";
UPDATE "user" SET "display_name" = "username" WHERE "display_name" IS NULL;

ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- Password now lives in the account table; keep the column one release for rollback.
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;

-- Auth session table (named auth_session: "session" is the analytics visitor table)
CREATE TABLE "auth_session" (
  "auth_session_id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "ip_address" VARCHAR(100),
  "user_agent" VARCHAR(500),
  "impersonated_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "auth_session_pkey" PRIMARY KEY ("auth_session_id")
);

CREATE UNIQUE INDEX "auth_session_token_key" ON "auth_session"("token");
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- Account table (credential + future oauth providers)
CREATE TABLE "account" (
  "account_id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "access_token_expires_at" TIMESTAMPTZ(6),
  "refresh_token_expires_at" TIMESTAMPTZ(6),
  "scope" TEXT,
  "id_token" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "account_pkey" PRIMARY KEY ("account_id")
);

CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- Verification table (required by better-auth core)
CREATE TABLE "verification" (
  "verification_id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "verification_pkey" PRIMARY KEY ("verification_id")
);

CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- Move existing bcrypt hashes into credential provider account rows.
-- The better-auth instance overrides password hashing with bcryptjs, so these
-- hashes keep verifying without a rehash-on-login.
-- account_id is derived from the (unique) user_id, avoiding a dependency on
-- gen_random_uuid()/pgcrypto for older PostgreSQL versions.
INSERT INTO "account"
  ("account_id", "user_id", "provider_account_id", "provider_id", "password", "created_at", "updated_at")
SELECT
  md5("user_id"::text || ':credential'),
  "user_id",
  "user_id"::text,
  'credential',
  "password",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "user"
WHERE "password" IS NOT NULL;
