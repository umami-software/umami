ALTER TABLE "website" ADD COLUMN "commerce_config" JSONB;
CREATE INDEX "commerce_event_website_id_cart_id_idx" ON "commerce_event" ("website_id", "cart_id");
