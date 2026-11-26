import { beforeEach, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { BarChart } from './BarChart';

const chartProps = vi.hoisted(() => ({ current: null as any }));

// Render the chart's children directly and capture the recharts chart's props.
vi.mock('@umami/react-zen', async importOriginal => ({
  ...(await importOriginal<typeof import('@umami/react-zen')>()),
  ChartContainer: ({ children }: any) => children,
}));

vi.mock('recharts', async importOriginal => ({
  ...(await importOriginal<typeof import('recharts')>()),
  ComposedChart: (props: any) => {
    chartProps.current = props;
    return null;
  },
}));

beforeEach(() => {
  chartProps.current = null;
});

/** A click on a time bucket, as recharts reports it. `index` is undefined for empty space. */
function click(index?: number, pointerType?: string) {
  chartProps.current.onClick(
    { activeTooltipIndex: index === undefined ? null : String(index) },
    { nativeEvent: pointerType ? { pointerType } : {} },
  );
}

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

  click(2);

  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 2, 1));
});

test('shows a pointer over clickable charts', () => {
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={vi.fn()}
    />,
  );

  expect(chartProps.current.style).toEqual({ cursor: 'pointer' });
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

  click();

  expect(onBarClick).not.toHaveBeenCalled();
});

// Touch has no hover, so drilling in on the first tap would hide the value being read (#4802).
test('a touch shows the bar first and drills in on a second tap of the same bar', () => {
  const onBarClick = vi.fn();

  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  click(2, 'touch');
  expect(onBarClick).not.toHaveBeenCalled();

  // Moving to another bar only shows that bar's value.
  click(4, 'touch');
  expect(onBarClick).not.toHaveBeenCalled();

  click(4, 'touch');
  expect(onBarClick).toHaveBeenCalledOnce();
  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 0, 5));
});

test('a touch on empty space clears the selected bar', () => {
  const onBarClick = vi.fn();

  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  click(2, 'touch');
  click(undefined, 'touch');
  click(2, 'touch');

  expect(onBarClick).not.toHaveBeenCalled();
});

test('a mouse click still drills in at once', () => {
  const onBarClick = vi.fn();

  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  click(2, 'mouse');

  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 0, 3));
});

test('leaves charts without a click handler unclickable', () => {
  render(<BarChart unit="day" minDate={new Date(2026, 0, 1)} maxDate={new Date(2026, 0, 31)} />);

  expect(chartProps.current.onClick).toBeUndefined();
  expect(chartProps.current.style).toBeUndefined();
});
