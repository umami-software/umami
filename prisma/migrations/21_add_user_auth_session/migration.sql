-- CreateTable
CREATE TABLE "user_auth_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshHash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_session_refreshHash_key" ON "user_auth_session"("refreshHash");

-- CreateIndex
CREATE INDEX "user_auth_session_userId_idx" ON "user_auth_session"("userId");