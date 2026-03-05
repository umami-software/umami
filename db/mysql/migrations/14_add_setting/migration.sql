-- Create table setting
CREATE TABLE IF NOT EXISTS `setting` (
  `setting_id` varchar(36) PRIMARY KEY,
  `key` varchar(255) UNIQUE NOT NULL,
  `value` varchar(4000),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


