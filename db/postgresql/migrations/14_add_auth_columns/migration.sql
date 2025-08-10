-- Add optional email and email_verified to user table for Auth.js compatibility
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS email varchar(255),
  ADD COLUMN IF NOT EXISTS email_verified timestamptz;

-- Ensure email is unique if present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'user_email_key'
  ) THEN
    CREATE UNIQUE INDEX user_email_key ON "user" (email);
  END IF;
END $$; 