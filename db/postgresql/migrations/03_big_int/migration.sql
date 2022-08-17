/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pageview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `website` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_event_old` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_session_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_website_id_fkey";

-- DropForeignKey
ALTER TABLE "event_data" DROP CONSTRAINT "event_data_event_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT "pageview_session_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT "pageview_website_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_website_id_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT "website_user_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP CONSTRAINT "account_pkey",
ALTER COLUMN "user_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "event" DROP CONSTRAINT "event_pkey",
ALTER COLUMN "event_id" SET DATA TYPE BIGINT,
ALTER COLUMN "website_id" SET DATA TYPE BIGINT,
ALTER COLUMN "session_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "event_pkey" PRIMARY KEY ("event_id");

-- AlterTable
ALTER TABLE "event_data" DROP CONSTRAINT "event_data_pkey",
ALTER COLUMN "event_data_id" SET DATA TYPE BIGINT,
ALTER COLUMN "event_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "event_data_pkey" PRIMARY KEY ("event_data_id");

-- AlterTable
ALTER TABLE "pageview" DROP CONSTRAINT "pageview_pkey",
ALTER COLUMN "view_id" SET DATA TYPE BIGINT,
ALTER COLUMN "website_id" SET DATA TYPE BIGINT,
ALTER COLUMN "session_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "pageview_pkey" PRIMARY KEY ("view_id");

-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "session_id" SET DATA TYPE BIGINT,
ALTER COLUMN "website_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("session_id");

-- AlterTable
ALTER TABLE "website" DROP CONSTRAINT "website_pkey",
ALTER COLUMN "website_id" SET DATA TYPE BIGINT,
ALTER COLUMN "user_id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "website_pkey" PRIMARY KEY ("website_id");

-- Dev: Alter Sequence
ALTER SEQUENCE account_user_id_seq AS BIGINT;
ALTER SEQUENCE event_data_event_data_id_seq AS BIGINT;
ALTER SEQUENCE event_event_id_seq AS BIGINT;
ALTER SEQUENCE pageview_view_id_seq AS BIGINT;
ALTER SEQUENCE session_session_id_seq AS BIGINT;
ALTER SEQUENCE website_website_id_seq AS BIGINT;

-- DropTable
DROP TABLE "_event_old";

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_data" ADD CONSTRAINT "event_data_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
