import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'getWebsiteStats.ts'),
  'utf8',
);

describe('getWebsiteStats visitor resolution', () => {
  it('counts visitors by resolved identity, then visitor_id, then session_id', () => {
    // PostgreSQL: LEFT JOIN yields real NULLs, plain coalesce is correct
    expect(src).toContain('coalesce(t.resolved_identity, t.visitor_id, t.session_id::text)');
    // ClickHouse: LEFT JOIN fills unmatched String with '', so nullIf is required
    expect(src).toContain(
      "coalesce(nullIf(t.resolved_identity, ''), nullIf(t.visitor_id, ''), toString(t.session_id))",
    );
  });

  it('does not double-join the session table (no duplicate join bug)', () => {
    const relational = src.split('async function clickhouseQuery')[0];
    const joins = relational.match(/left join session/g) ?? [];
    expect(joins.length).toBe(1);
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional literal string check
    expect(relational).not.toContain('${joinSessionQuery}');
  });

  it('keeps the clickhouse table unaliased so fragment filters resolve', () => {
    const clickhouse = src.split('async function clickhouseQuery')[1];
    expect(clickhouse).not.toContain('website_event we');
    expect(clickhouse).toContain('from identity_link final');
  });

  it('de-duplicates identity_link to one identity per visitor (prevents row fan-out)', () => {
    const relational = src.split('async function clickhouseQuery')[0];
    const clickhouse = src.split('async function clickhouseQuery')[1];
    // PostgreSQL picks the earliest-linked distinct_id per visitor
    expect(relational).toContain('distinct on (website_id, visitor_id)');
    // ClickHouse picks the earliest-linked distinct_id per visitor
    expect(clickhouse).toContain('argMin(distinct_id, linked_at)');
  });
});
