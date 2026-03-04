ALTER TABLE "session_replay"
ADD COLUMN IF NOT EXISTS "visit_id" UUID;

UPDATE "session_replay" AS sr
SET "visit_id" = we."visit_id"
FROM (
  SELECT DISTINCT ON ("website_id", "session_id")
    "website_id",
    "session_id",
    "visit_id"
  FROM "website_event"
  WHERE "visit_id" IS NOT NULL
  ORDER BY "website_id", "session_id", "created_at" DESC
) AS we
WHERE sr."visit_id" IS NULL
  AND sr."website_id" = we."website_id"
  AND sr."session_id" = we."session_id";

UPDATE "session_replay"
SET "visit_id" = (
  substr(md5("session_id"::text || ':' || "chunk_index"::text), 1, 8) ||
  '-' ||
  substr(md5("session_id"::text || ':' || "chunk_index"::text), 9, 4) ||
  '-' ||
  substr(md5("session_id"::text || ':' || "chunk_index"::text), 13, 4) ||
  '-' ||
  substr(md5("session_id"::text || ':' || "chunk_index"::text), 17, 4) ||
  '-' ||
  substr(md5("session_id"::text || ':' || "chunk_index"::text), 21, 12)
)::uuid
WHERE "visit_id" IS NULL;

ALTER TABLE "session_replay"
ALTER COLUMN "visit_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "session_replay_visit_id_idx" ON "session_replay"("visit_id");
