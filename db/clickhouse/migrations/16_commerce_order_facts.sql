ALTER TABLE umami.commerce_event
    ADD COLUMN kind LowCardinality(String) DEFAULT if(order_id = '', 'observation', 'order'),
    ADD COLUMN source String DEFAULT '',
    ADD COLUMN reference_id String DEFAULT '',
    ADD COLUMN customer_id String DEFAULT '',
    MODIFY COLUMN session_id Nullable(UUID),
    MODIFY COLUMN visit_id Nullable(UUID),
    MODIFY COLUMN subtotal Nullable(Decimal(19, 4)),
    MODIFY COLUMN shipping Nullable(Decimal(19, 4)),
    MODIFY COLUMN tax Nullable(Decimal(19, 4));
ALTER TABLE umami.commerce_item
    ADD COLUMN line_id String DEFAULT '',
    MODIFY COLUMN price Nullable(Decimal(19, 4)),
    MODIFY COLUMN total Nullable(Decimal(19, 4));
