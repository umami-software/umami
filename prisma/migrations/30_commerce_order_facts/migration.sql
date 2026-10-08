-- Historical cart observations remain stored, but are excluded from order reports.
ALTER TABLE commerce_event
  ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'order',
  ADD COLUMN source VARCHAR(200),
  ADD COLUMN reference_id VARCHAR(200),
  ADD COLUMN customer_id VARCHAR(200),
  ALTER COLUMN session_id DROP NOT NULL,
  ALTER COLUMN visit_id DROP NOT NULL,
  ALTER COLUMN subtotal DROP NOT NULL,
  ALTER COLUMN shipping DROP NOT NULL,
  ALTER COLUMN tax DROP NOT NULL;
UPDATE commerce_event SET kind = 'observation' WHERE order_id IS NULL;
ALTER TABLE commerce_item
  ADD COLUMN line_id VARCHAR(200),
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN total DROP NOT NULL;
-- Obsolete cart/checkout columns remain for historical data.
