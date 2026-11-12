import { beforeEach, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { BarChart } from './BarChart';

const chartProps = vi.hoisted(() => ({ current: null as any }));

vi.mock('@/components/charts/Chart', () => ({
  Chart: (props: any) => {
    chartProps.current = props;
    return null;
  },
}));

beforeEach(() => {
  chartProps.current = null;
});

test('reports the date of the clicked bar', () => {
  // Bars are positional, so the date must come from the bucket index. Empty buckets have no date.
  const onBarClick = vi.fn();

  render(
    <BarChart
      unit="month"
      minDate={new Date(2026, 0, 15)}
      maxDate={new Date(2026, 5, 30)}
      onBarClick={onBarClick}
    />,
  );

  chartProps.current.chartOptions.onClick({}, [{ index: 2 }]);

  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 2, 1));
});

test('resets the pointer cursor when a click changes the range', () => {
  // The canvas is reused and an hourly view has no hover handler to reset it.
  const canvas = document.createElement('canvas');
  canvas.style.cursor = 'pointer';

  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={vi.fn()}
    />,
  );

  chartProps.current.chartOptions.onClick({ native: { target: canvas } }, [{ index: 0 }]);

  expect(canvas.style.cursor).toBe('default');
});

test('ignores clicks that miss every bar', () => {
  const onBarClick = vi.fn();

  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  chartProps.current.chartOptions.onClick({}, []);

  expect(onBarClick).not.toHaveBeenCalled();
});

test('leaves charts without a click handler unclickable', () => {
  render(<BarChart unit="day" minDate={new Date(2026, 0, 1)} maxDate={new Date(2026, 0, 31)} />);

  expect(chartProps.current.chartOptions.onClick).toBeUndefined();
  expect(chartProps.current.chartOptions.onHover).toBeUndefined();
});
