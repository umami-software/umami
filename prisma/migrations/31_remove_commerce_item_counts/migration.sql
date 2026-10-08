-- Quantities are no longer collected. Retain historical values without requiring new ones.
ALTER TABLE commerce_item ALTER COLUMN quantity DROP NOT NULL;
