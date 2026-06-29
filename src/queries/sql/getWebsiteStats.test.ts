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
    expect(src).toContain('coalesce(t.resolved_identity, t.visitor_id, t.session_id::text)');
    expect(src).toContain('coalesce(t.resolved_identity, t.visitor_id, toString(t.session_id))');
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
    expect(clickhouse).toContain('left join identity_link final il');
  });
});
