import { act } from '@testing-library/react';
import { Children, isValidElement, useSyncExternalStore } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { BarChart } from './BarChart';

const mocks = vi.hoisted(() => {
  let area: any = null;
  const listeners = new Set<() => void>();

  return {
    chartRenders: 0,
    markers: null as any,
    plotArea: {
      get: () => area,
      set: (next: any) => {
        area = next;
        listeners.forEach(listener => listener());
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  };
});

vi.mock('@umami/react-zen', async importOriginal => ({
  ...(await importOriginal<typeof import('@umami/react-zen')>()),
  ChartContainer: ({ children }: any) => children,
}));

// Count chart renders, and render only the plot area reporter, fed from a test store.
vi.mock('recharts', async importOriginal => ({
  ...(await importOriginal<typeof import('recharts')>()),
  usePlotArea: () =>
    useSyncExternalStore(mocks.plotArea.subscribe, mocks.plotArea.get, mocks.plotArea.get),
  ComposedChart: ({ children }: any) => {
    mocks.chartRenders++;
    return Children.toArray(children).filter(
      child => isValidElement(child) && (child.type as any).name === 'PlotAreaReporter',
    );
  },
}));

vi.mock('./ChartAnnotationMarkers', async importOriginal => ({
  ...(await importOriginal<typeof import('./ChartAnnotationMarkers')>()),
  ChartAnnotationMarkers: ({ markers }: any) => {
    mocks.markers = markers;
    return null;
  },
}));

beforeEach(() => {
  mocks.chartRenders = 0;
  mocks.markers = null;
  mocks.plotArea.set(null);
});

test('moves annotation markers with the plot area without re-rendering the chart', () => {
  // Re-rendering resets Recharts' auto-width y axis, which moves the plot area again: an endless loop.
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 2)}
      chartData={{ datasets: [{ label: 'Views', data: [1, 2] }] }}
      annotations={[{ id: 'a', date: new Date(2026, 0, 2), label: 'Launch' } as any]}
    />,
  );
  const renders = mocks.chartRenders;

  act(() => mocks.plotArea.set({ x: 60, y: 0, width: 200, height: 100 }));
  expect(mocks.markers[0].x).toBe(210);

  act(() => mocks.plotArea.set({ x: 40, y: 0, width: 220, height: 100 }));
  expect(mocks.markers[0].x).toBe(205);

  expect(mocks.chartRenders).toBe(renders);
});
