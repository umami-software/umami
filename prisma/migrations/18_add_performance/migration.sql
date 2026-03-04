-- AlterTable
ALTER TABLE "website_event" ADD COLUMN     "cls" DECIMAL(10,4),
ADD COLUMN     "fcp" DECIMAL(10,1),
ADD COLUMN     "inp" DECIMAL(10,1),
ADD COLUMN     "lcp" DECIMAL(10,1),
ADD COLUMN     "ttfb" DECIMAL(10,1);
