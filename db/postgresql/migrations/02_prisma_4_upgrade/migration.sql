-- RenameIndex
ALTER INDEX "account.username_unique" RENAME TO "account_username_key";

-- RenameIndex
ALTER INDEX "session.session_uuid_unique" RENAME TO "session_session_uuid_key";

-- RenameIndex
ALTER INDEX "website.share_id_unique" RENAME TO "website_share_id_idx";

-- RenameIndex
ALTER INDEX "website.website_uuid_unique" RENAME TO "website_website_uuid_key";
