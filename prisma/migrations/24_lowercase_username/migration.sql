-- Usernames are normalized to lowercase on lookup, creation and update, but accounts
-- created before that change may still be stored with uppercase characters, which makes
-- them impossible to log in to. Lowercase them so they match what the login query looks for.
-- Accounts that would collide with another account once lowercased are left untouched so
-- this migration can never fail on the unique username constraint.
UPDATE "user" AS u
SET "username" = LOWER(u."username")
WHERE u."deleted_at" IS NULL
  AND u."username" <> LOWER(u."username")
  AND NOT EXISTS (
    SELECT 1
    FROM "user" AS c
    WHERE c."user_id" <> u."user_id"
      AND LOWER(c."username") = LOWER(u."username")
  );
