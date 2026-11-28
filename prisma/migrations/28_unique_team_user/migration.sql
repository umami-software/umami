-- Deduplicate existing (team_id, user_id) rows before adding the unique index,
-- keeping the highest-privilege role, then earliest created_at (NULLS LAST), then team_user_id ASC.
DELETE FROM "team_user"
WHERE "team_user_id" IN (
  SELECT "team_user_id"
  FROM (
    SELECT
      "team_user_id",
      ROW_NUMBER() OVER (
        PARTITION BY "team_id", "user_id"
        ORDER BY
          CASE "role"
            WHEN 'team-owner' THEN 0
            WHEN 'team-manager' THEN 1
            WHEN 'team-member' THEN 2
            WHEN 'team-view-only' THEN 3
            ELSE 4
          END ASC,
          "created_at" ASC NULLS LAST,
          "team_user_id" ASC
      ) AS rn
    FROM "team_user"
  ) ranked
  WHERE rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "team_user_team_id_user_id_key" ON "team_user"("team_id", "user_id");
