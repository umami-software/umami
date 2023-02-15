-- AlterTable
ALTER TABLE "session" ADD COLUMN     "city" VARCHAR(50),
ADD COLUMN     "subdivision" CHAR(3);

-- AlterTable
ALTER TABLE "website_event" ADD COLUMN     "page_title" VARCHAR(500);
