
-- AlterTable
ALTER TABLE "account" ADD COLUMN "account_uuid" UUID NULL;

-- Backfill UUID
UPDATE "account" SET account_uuid = gen_random_uuid();

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "account_uuid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_account_uuid_key" ON "account"("account_uuid");
