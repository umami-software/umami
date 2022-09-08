-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT IF EXISTS "event_session_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT IF EXISTS "event_website_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT IF EXISTS "pageview_session_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT IF EXISTS "pageview_website_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_website_id_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT IF EXISTS "website_user_id_fkey";

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
