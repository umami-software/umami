import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'index.js'), 'utf8');

describe('tracker identity stitching default', () => {
  it('is opt-in: only enabled when data-identity-stitching === "true"', () => {
    expect(src).toContain("config('identity-stitching') === _true");
    expect(src).not.toContain("config('identity-stitching') !== _false");
  });

  it('does not read/write localStorage for a visitor id unless enabled', () => {
    // getVisitorId must guard on identityStitching before touching localStorage
    expect(src).toMatch(/getVisitorId[\s\S]*?if \(!identityStitching/);
  });
});
