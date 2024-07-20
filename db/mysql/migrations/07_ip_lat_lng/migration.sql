-- AlterTable
ALTER TABLE "session" ADD COLUMN "ip" VARCHAR(255),
ADD COLUMN "lat" FLOAT,
ADD COLUMN "lng" FLOAT;

-- CreateIndex
CREATE INDEX `session_website_id_created_at_ip_idx` ON `session`(`website_id`, `created_at`, `ip`);
CREATE INDEX `session_website_id_created_at_lat_idx` ON `session`(`website_id`, `created_at`, `lat`);
CREATE INDEX `session_website_id_created_at_lng_idx` ON `session`(`website_id`, `created_at`, `lng`);
