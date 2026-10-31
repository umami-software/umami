-- CreateTable
CREATE TABLE "webauthn_credential" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_challenge" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "challenge" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "webauthn_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credential_credential_id_key" ON "webauthn_credential"("credential_id");

-- CreateIndex
CREATE INDEX "webauthn_credential_user_id_idx" ON "webauthn_credential"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_challenge_user_id_type_key" ON "webauthn_challenge"("user_id", "type");
