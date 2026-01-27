-- CreateIndex
CREATE INDEX "website_event_website_id_created_at_event_type_session_id_idx" ON "website_event"("website_id", "created_at", "event_type", "session_id");
