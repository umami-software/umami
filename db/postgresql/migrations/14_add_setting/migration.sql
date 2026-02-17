-- Create table setting
CREATE TABLE IF NOT EXISTS "setting" (
  "setting_id" uuid PRIMARY KEY,
  "key" varchar(255) UNIQUE NOT NULL,
  "value" varchar(4000),
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6)
);


