-- Migration: Add User ID Mapping
-- Description: Add user_id column to session table for unified user identification
-- Date: 2025-11-05

-- Add user_id column to session table
ALTER TABLE session ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);

-- Create user_mapping table for tracking visitor_id to user_id relationships
CREATE TABLE IF NOT EXISTS user_mapping (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_count INTEGER DEFAULT 1,
    UNIQUE(visitor_id, user_id)
);

-- Add indexes for user_mapping
CREATE INDEX IF NOT EXISTS idx_user_mapping_visitor ON user_mapping(visitor_id);
CREATE INDEX IF NOT EXISTS idx_user_mapping_user ON user_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mapping_last_seen ON user_mapping(last_seen_at);

-- Add comments
COMMENT ON COLUMN session.user_id IS 'WordPress user ID for logged-in users';
COMMENT ON TABLE user_mapping IS 'Maps visitor IDs to user IDs for unified identification';
COMMENT ON COLUMN user_mapping.visitor_id IS 'Umami visitor ID (anonymous)';
COMMENT ON COLUMN user_mapping.user_id IS 'WordPress user ID (logged-in)';
COMMENT ON COLUMN user_mapping.session_count IS 'Number of sessions for this visitor-user pair';

