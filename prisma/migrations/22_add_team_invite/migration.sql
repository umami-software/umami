BEGIN;

-- CreateTable
CREATE TABLE "team_invite" (
    "team_invite_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "issuer_id" UUID NOT NULL,
    "token_digest" VARCHAR(128) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "used_at" TIMESTAMPTZ(6),
    "used_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_invite_pkey" PRIMARY KEY ("team_invite_id"),
    CONSTRAINT "team_invite_role_check" CHECK (
        "role" IN ('team-member', 'team-view-only')
    ),
    CONSTRAINT "team_invite_single_terminal_state" CHECK (
        NOT ("revoked_at" IS NOT NULL AND "used_at" IS NOT NULL)
    ),
    CONSTRAINT "team_invite_redemption_attribution" CHECK (
        ("used_at" IS NULL) = ("used_by" IS NULL)
    )
);

-- DeduplicateTeamUsers
LOCK TABLE "team_user" IN SHARE ROW EXCLUSIVE MODE;

WITH "ranked_team_user" AS (
    SELECT
        "team_user_id",
        ROW_NUMBER() OVER (
            PARTITION BY "team_id", "user_id"
            -- Preserve the most recently changed membership so an older duplicate
            -- cannot restore a stale role when the unique constraint is added.
            ORDER BY "updated_at" DESC NULLS LAST, "created_at" DESC NULLS LAST, "team_user_id" DESC
        ) AS "row_number"
    FROM "team_user"
)
DELETE FROM "team_user"
USING "ranked_team_user"
WHERE "team_user"."team_user_id" = "ranked_team_user"."team_user_id"
  AND "ranked_team_user"."row_number" > 1;

-- CreateIndex
CREATE UNIQUE INDEX "team_user_team_id_user_id_key" ON "team_user"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_invite_token_digest_key" ON "team_invite"("token_digest");
CREATE INDEX "team_invite_team_id_idx" ON "team_invite"("team_id");
CREATE INDEX "team_invite_issuer_id_idx" ON "team_invite"("issuer_id");
CREATE INDEX "team_invite_used_by_idx" ON "team_invite"("used_by");
CREATE INDEX "team_invite_expires_at_idx" ON "team_invite"("expires_at");

COMMIT;
