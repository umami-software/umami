import { describe, expect, it } from 'vitest';
import {
  buildSnapshotUrl,
  getSnapshotForGroup,
  getSnapshotFrame,
  getSnapshotFrameHeight,
  pickRepresentativeViewport,
} from './heatmap-preview';

const snapshot = {
  kind: 'iframe' as const,
  id: 'snap',
  url: 'https://example.com/page',
  pageW: 1920,
  pageH: 5000,
  viewportW: 1920,
  viewportH: 1080,
};

describe('pickRepresentativeViewport', () => {
  it('returns null without usable metrics', () => {
    expect(pickRepresentativeViewport([])).toBeNull();
    expect(
      pickRepresentativeViewport([{ viewportW: 0, viewportH: 0, pageW: 1, pageH: 1, count: 3 }]),
    ).toBeNull();
  });

  it('picks the viewport with most weight and the largest page size of that viewport', () => {
    const result = pickRepresentativeViewport([
      { viewportW: 2764, viewportH: 1200, pageW: 2749, pageH: 9000, count: 2 },
      { viewportW: 2560, viewportH: 1300, pageW: 2545, pageH: 7000, count: 3 },
      { viewportW: 2764, viewportH: 1200, pageW: 2749, pageH: 9500, count: 2 },
    ]);

    expect(result).toEqual({ viewportW: 2764, viewportH: 1200, pageW: 2749, pageH: 9500 });
  });
});

describe('getSnapshotForGroup', () => {
  it('falls back to the server snapshot when the group has no data', () => {
    expect(getSnapshotForGroup(snapshot, [])).toBe(snapshot);
  });

  it('replaces the viewport with the group one and keeps the url', () => {
    const result = getSnapshotForGroup(snapshot, [
      { viewportW: 414, viewportH: 800, pageW: 414, pageH: 4000, count: 5 },
    ]);

    expect(result).toMatchObject({
      url: snapshot.url,
      viewportW: 414,
      viewportH: 800,
      pageW: 414,
      pageH: 4000,
    });
    expect(result.id).not.toBe(snapshot.id);
  });
});

describe('getSnapshotFrameHeight', () => {
  it('uses the viewport height for near-single-screen pages', () => {
    expect(getSnapshotFrameHeight({ pageH: 1200, viewportH: 1000 })).toBe(1000);
    expect(getSnapshotFrameHeight({ pageH: 3000, viewportH: 1000 })).toBe(3000);
  });
});

describe('buildSnapshotUrl', () => {
  it('appends the viewport fragment', () => {
    expect(buildSnapshotUrl('https://example.com/a?x=1', 414, 800)).toBe(
      'https://example.com/a?x=1#umami-viewport=414x800',
    );
  });

  it('replaces an existing fragment', () => {
    expect(buildSnapshotUrl('https://example.com/a#section', 1920.4, 1080)).toBe(
      'https://example.com/a#umami-viewport=1920x1080',
    );
  });
});

describe('getSnapshotFrame', () => {
  it('lays out at the visitor width and scales to the target width', () => {
    const frame = getSnapshotFrame(
      { ...snapshot, viewportW: 2764, viewportH: 1200, pageW: 2749, pageH: 10000 },
      1920,
    );

    expect(frame.width).toBe(2749);
    expect(frame.height).toBe(10000);
    expect(frame.scale).toBeCloseTo(1920 / 2764);
    expect(frame.scaledHeight).toBeCloseTo((10000 * 1920) / 2764);
    expect(frame.url).toBe('https://example.com/page#umami-viewport=2764x1200');
  });

  it('uses the viewport width when the page width is missing or larger', () => {
    expect(getSnapshotFrame({ ...snapshot, pageW: 0 }, 1920).width).toBe(1920);
    expect(getSnapshotFrame({ ...snapshot, pageW: 2500 }, 1920).width).toBe(1920);
  });

  it('keeps a single screen page at the viewport height', () => {
    const frame = getSnapshotFrame({ ...snapshot, pageH: 1100 }, 1920);

    expect(frame.height).toBe(1080);
    expect(frame.scale).toBe(1);
  });
});
