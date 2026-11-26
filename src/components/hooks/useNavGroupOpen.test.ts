import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('./useConfig', () => ({ useConfig: () => ({}) }));
vi.mock('./useMessages', () => ({ useMessages: () => ({ t: (s: string) => s, labels: {} }) }));
vi.mock('./useNavigation', () => ({
  useNavigation: () => ({ pathname: '/', renderUrl: (s: string) => s }),
}));

import { type NavItem, useNavGroupOpen } from './useWebsiteNavItems';

const item: NavItem = {
  id: 'events',
  label: 'Events',
  path: '/events',
  children: [
    { id: 'events-chart', label: 'Chart', path: '/events' },
    { id: 'events-activity', label: 'Activity', path: '/events/activity' },
  ],
};

describe('useNavGroupOpen', () => {
  test('is collapsed by default', () => {
    const { result } = renderHook(() => useNavGroupOpen(item, 'overview'));

    expect(result.current.open).toBe(false);
  });

  test('starts open when a sub-item is selected', () => {
    const { result } = renderHook(() => useNavGroupOpen(item, 'events-activity'));

    expect(result.current.open).toBe(true);
  });

  test('opens when navigating to a sub-item, and can be toggled', () => {
    const { result, rerender } = renderHook(({ key }) => useNavGroupOpen(item, key), {
      initialProps: { key: 'overview' },
    });

    rerender({ key: 'events-chart' });
    expect(result.current.open).toBe(true);

    act(() => result.current.setOpen(false));
    expect(result.current.open).toBe(false);
  });
});
