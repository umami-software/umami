import { afterEach, describe, expect, test } from 'vitest';
import { clearReplays, setReplays, useReplays } from './replays';

afterEach(() => {
  useReplays.setState({ websiteId: undefined, source: undefined, replays: [] });
});

describe('replay navigation store', () => {
  test('does not clear a newer replay list from another source', () => {
    setReplays('website-1', 'replays', [{ id: 'replay-1' }]);
    setReplays('website-1', 'saved', [{ visitId: 'replay-2' }]);

    clearReplays('website-1', 'replays');

    expect(useReplays.getState()).toMatchObject({
      websiteId: 'website-1',
      source: 'saved',
      replays: [{ visitId: 'replay-2' }],
    });
  });

  test('clears the active list when its owner unmounts', () => {
    setReplays('website-1', 'replays', [{ id: 'replay-1' }]);

    clearReplays('website-1', 'replays');

    expect(useReplays.getState()).toMatchObject({
      websiteId: undefined,
      source: undefined,
      replays: [],
    });
  });
});
