/*
  Warnings:

  - You are about to drop the column `userId` on the `team_website` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `website_event` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `website_event` table. All the data in the column will be lost.
  - Added the required column `url_path` to the `website_event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team_website" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "website_event" DROP COLUMN "referrer",
DROP COLUMN "url",
ADD COLUMN     "referrer_domain" VARCHAR(500),
ADD COLUMN     "referrer_path" VARCHAR(500),
ADD COLUMN     "referrer_query" VARCHAR(500),
ADD COLUMN     "url_path" VARCHAR(500) NOT NULL,
ADD COLUMN     "url_query" VARCHAR(500);
