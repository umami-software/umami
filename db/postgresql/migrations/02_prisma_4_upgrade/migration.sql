-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_session_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_website_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT "pageview_session_id_fkey";

-- DropForeignKey
ALTER TABLE "pageview" DROP CONSTRAINT "pageview_website_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_website_id_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT "website_user_id_fkey";

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pageview" ADD CONSTRAINT "pageview_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "website"("website_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "account"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "account.username_unique" RENAME TO "account_username_key";

-- RenameIndex
ALTER INDEX "session.session_uuid_unique" RENAME TO "session_session_uuid_key";

-- RenameIndex
ALTER INDEX "website.share_id_unique" RENAME TO "website_share_id_idx";

-- RenameIndex
ALTER INDEX "website.website_uuid_unique" RENAME TO "website_website_uuid_key";
