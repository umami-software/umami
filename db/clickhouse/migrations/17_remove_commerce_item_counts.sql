-- Retain historical quantities; new writes omit them.
ALTER TABLE umami.commerce_item MODIFY COLUMN quantity Nullable(UInt32);
