-- Rollback migration for user_mapping constraints
-- Run this script to revert the changes made in migration.sql

-- Drop composite index on session table
DROP INDEX IF EXISTS session_website_id_user_id_idx;

-- Drop composite index on user_mapping table
DROP INDEX IF EXISTS user_mapping_website_id_user_id_idx;

-- Drop foreign key constraint
ALTER TABLE user_mapping 
DROP CONSTRAINT IF EXISTS user_mapping_website_id_fkey;

-- Drop website_id column
ALTER TABLE user_mapping DROP COLUMN IF EXISTS website_id;

