-- OceanBase initialization script for Umami
-- This script creates the umami database and user

-- Create umami user (if not exists)
-- Note: In OceanBase, you may need to connect as root first
-- CREATE USER IF NOT EXISTS 'umami'@'%' IDENTIFIED BY 'umami_password';

-- Grant privileges to umami user
-- GRANT ALL PRIVILEGES ON umami.* TO 'umami'@'%';

-- Create umami database
CREATE DATABASE IF NOT EXISTS umami CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use umami database
USE umami;

-- Note: The rest of the schema is in schema.sql
-- Run schema.sql after this initialization script