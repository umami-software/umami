import { beforeEach, describe, expect, test } from 'vitest';
import { initialState, saveDashboard, useDashboard } from './dashboard';

beforeEach(() => {
  useDashboard.setState({ ...initialState }, true);
});

describe('saveDashboard', () => {
  test('merges the provided settings into state', () => {
    saveDashboard({ editing: true });

    const state = useDashboard.getState() as any;
    expect(state.editing).toBe(true);
    expect(state.showCharts).toBe(initialState.showCharts);
  });

  test('updates multiple fields at once', () => {
    saveDashboard({ limit: 20, isEdited: true, websiteOrder: ['a', 'b'] });

    const state = useDashboard.getState() as any;
    expect(state.limit).toBe(20);
    expect(state.isEdited).toBe(true);
    expect(state.websiteOrder).toEqual(['a', 'b']);
  });

  test('persists the resulting state to storage', () => {
    saveDashboard({ editing: true });

    const stored = JSON.parse(localStorage.getItem('umami.dashboard') as string);
    expect(stored.editing).toBe(true);
  });
});
