-- Add websiteId column to user_mapping table
ALTER TABLE user_mapping ADD COLUMN website_id UUID;

-- Update existing rows with a default website_id (you may need to adjust this based on your data)
-- This assumes you have at least one website in your database
UPDATE user_mapping 
SET website_id = (SELECT website_id FROM website LIMIT 1)
WHERE website_id IS NULL;

-- Make website_id NOT NULL after populating
ALTER TABLE user_mapping ALTER COLUMN website_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE user_mapping 
ADD CONSTRAINT user_mapping_website_id_fkey 
FOREIGN KEY (website_id) REFERENCES website(website_id);

-- Add composite index for better query performance
CREATE INDEX user_mapping_website_id_user_id_idx ON user_mapping(website_id, user_id);

-- Add composite index on session table for better join performance
CREATE INDEX session_website_id_user_id_idx ON session(website_id, user_id);

