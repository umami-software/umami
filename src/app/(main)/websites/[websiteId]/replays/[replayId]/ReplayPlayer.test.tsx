import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ReplayPlayer } from './ReplayPlayer';

const { listeners } = vi.hoisted(() => ({
  listeners: [] as ((event: { payload: string }) => void)[],
}));

vi.mock('@/components/hooks', () => ({
  useMobile: () => ({ isMobile: false, isPhone: false }),
}));

vi.mock('rrweb-player', () => ({
  default: class {
    addEventListener(event: string, handler: (event: { payload: string }) => void) {
      if (event === 'ui-update-player-state') {
        listeners.push(handler);
      }
    }
    $destroy() {}
  },
}));

const events = [
  { type: 4, timestamp: 1000, data: { width: 1024, height: 768 } },
  {
    type: 2,
    timestamp: 1001,
    data: { node: { type: 0, id: 1, childNodes: [] }, initialOffset: { top: 0, left: 0 } },
  },
];

function emit(payload: string) {
  act(() => {
    for (const listener of listeners) {
      listener({ payload });
    }
  });
}

beforeEach(() => {
  listeners.length = 0;
});

test('calls onPlay each time playback starts', async () => {
  const onPlay = vi.fn();

  render(<ReplayPlayer events={events} onPlay={onPlay} />);
  await waitFor(() => expect(listeners).toHaveLength(1));

  emit('paused');
  expect(onPlay).not.toHaveBeenCalled();

  emit('playing');
  emit('paused');
  emit('playing');
  expect(onPlay).toHaveBeenCalledTimes(2);
});
