-- AlterTable
ALTER TABLE "account" ADD COLUMN     "is_viewer" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_event_old";

-- CreateTable
CREATE TABLE "viewerforwebsite" (
    "user_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,

    CONSTRAINT "viewerforwebsite_pkey" PRIMARY KEY ("user_id","website_id")
);

-- AddForeignKey
ALTER TABLE "viewerforwebsite" ADD CONSTRAINT "viewerforwebsite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewerforwebsite" ADD CONSTRAINT "viewerforwebsite_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;
