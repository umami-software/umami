-- Collapse rows that share a session and key, keeping the most recent one.
-- Ordering falls back to the primary key so rows written within the same
-- timestamp, or before created_at had a default, resolve deterministically.
DELETE FROM "session_data"
WHERE "session_data_id" IN (
    SELECT "session_data_id"
    FROM (
        SELECT
            "session_data_id",
            row_number() OVER (
                PARTITION BY "session_id", "data_key"
                ORDER BY "created_at" DESC NULLS LAST, "session_data_id" DESC
            ) AS rn
        FROM "session_data"
    ) ranked
    WHERE rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "session_data_session_id_data_key_key" ON "session_data"("session_id", "data_key");
