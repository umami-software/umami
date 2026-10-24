import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/clickhouse', () => ({ default: {} }));
vi.mock('@/lib/prisma', () => ({ default: {} }));
vi.mock('@/lib/db', () => ({ CLICKHOUSE: 'clickhouse', PRISMA: 'prisma', runQuery: vi.fn() }));
vi.mock('@/queries/prisma', () => ({ getWebsite: vi.fn() }));

import { type HeatmapPoint, pickSnapshotViewport } from './getHeatmap';

function point(pageY: number, pageH: number, count = 1): HeatmapPoint {
  return {
    x: 0,
    y: 0,
    pageX: 100,
    pageY,
    pageW: 1440,
    pageH,
    viewportW: 1440,
    viewportH: 900,
    count,
  };
}

describe('pickSnapshotViewport', () => {
  it('ignores a single taller outlier pageH', () => {
    const result = pickSnapshotViewport([point(865, 900, 3), point(450, 900), point(449, 2239)]);

    expect(result?.pageH).toBe(900);
  });

  it('extends past the most common pageH only to fit the clicks', () => {
    const result = pickSnapshotViewport([point(865, 900, 3), point(1500, 900)]);

    expect(result?.pageH).toBeGreaterThanOrEqual(1500);
    expect(result?.pageH).toBeLessThan(2239);
  });

  it('keeps pageH when all clicks agree', () => {
    expect(pickSnapshotViewport([point(100, 3000, 2)])?.pageH).toBe(3000);
  });
});
