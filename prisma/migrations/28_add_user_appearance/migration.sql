-- CreateTable (additive: no existing table is altered)
CREATE TABLE "user_appearance" (
    "user_id" UUID NOT NULL,
    "settings" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_appearance_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_appearance" ADD CONSTRAINT "user_appearance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
