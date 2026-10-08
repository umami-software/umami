-- Retire the feature without rewriting migrations already applied to existing databases.
BEGIN;

DROP TABLE IF EXISTS "commerce_item";
DROP TABLE IF EXISTS "commerce_event";
ALTER TABLE "website" DROP COLUMN IF EXISTS "commerce_config";

DELETE FROM "report" WHERE "type" = 'commerce';

-- Keep a removed section from turning a restricted share into an unrestricted one.
UPDATE "share"
SET "parameters" = ('{"overview":false}'::jsonb || "parameters") - 'commerce'
WHERE "parameters" ? 'commerce';

-- Clear obsolete widgets while preserving the board layout and other components.
UPDATE "board"
SET "parameters" = jsonb_set("parameters", '{rows}', (
    SELECT jsonb_agg(
        CASE WHEN jsonb_typeof(board_row -> 'columns') = 'array' THEN
            jsonb_set(board_row, '{columns}', COALESCE((
                SELECT jsonb_agg(
                    CASE WHEN board_column #>> '{component,type}' IN (
                        'CommerceReport', 'CommerceMetricsBar', 'CommerceChart',
                        'CommerceMetricsTable', 'CommerceProducts', 'CommerceCheckout'
                    ) THEN board_column - 'component' ELSE board_column END
                    ORDER BY column_index
                )
                FROM jsonb_array_elements(board_row -> 'columns')
                    WITH ORDINALITY AS columns_data(board_column, column_index)
            ), '[]'::jsonb))
        ELSE board_row END
        ORDER BY row_index
    )
    FROM jsonb_array_elements("parameters" -> 'rows')
        WITH ORDINALITY AS rows_data(board_row, row_index)
))
WHERE jsonb_typeof("parameters" -> 'rows') = 'array'
  AND "parameters" -> 'rows' <> '[]'::jsonb
  AND "parameters"::text LIKE '%Commerce%';

COMMIT;
