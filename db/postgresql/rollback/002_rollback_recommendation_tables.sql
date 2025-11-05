-- Rollback Migration: Remove Recommendation Engine Tables
-- Created: 2025-01-15
-- Description: Drops all recommendation engine tables and their dependencies
-- WARNING: This will permanently delete all recommendation data, user profiles, and ML model registry!

-- Drop tables in reverse order of dependencies
-- Drop recommendations table first (has foreign key to website)
DROP TABLE IF EXISTS recommendations CASCADE;

-- Drop user_profiles table (has foreign key to website)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop ml_models table (no dependencies)
DROP TABLE IF EXISTS ml_models CASCADE;

-- Log rollback completion
DO $$
BEGIN
  RAISE NOTICE 'Rollback complete: All recommendation engine tables removed';
  RAISE NOTICE 'Dropped tables: recommendations, user_profiles, ml_models';
END $$;

