-- AlterTable
ALTER TABLE "link"
ADD COLUMN     "og_title" VARCHAR(255),
ADD COLUMN     "og_description" VARCHAR(500),
ADD COLUMN     "og_image" VARCHAR(2047),
ADD COLUMN     "og_title_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "og_description_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "og_image_manual" BOOLEAN NOT NULL DEFAULT false;
