import { cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { BarChart } from './BarChart';

const chartProps = vi.hoisted(() => ({ current: null as any }));

function hitTest({ clientX, clientY }: { clientX: number; clientY: number }) {
  if (clientY >= 180) return [];
  return [{ index: 2, datasetIndex: clientX < 150 ? 0 : 1 }];
}

vi.mock('chart.js/auto', () => ({
  default: {
    getChart: (canvas: HTMLCanvasElement) => ({
      canvas,
      getElementsAtEventForMode: (event: TouchEvent) => hitTest(event.touches[0]),
    }),
  },
}));

vi.mock('@/components/charts/Chart', () => ({
  Chart: (props: any) => {
    chartProps.current = props;
    const showTooltip = (pointer: { clientX: number; clientY: number }) => {
      // The real Chart.js tooltip can keep its active bar outside the plotting area.
      if (pointer.clientY >= 200) return;
      const [bar] = hitTest(pointer);
      props.onTooltip({
        tooltip: bar
          ? {
              opacity: 1,
              labelColors: [{ backgroundColor: 'red' }],
              dataPoints: [
                {
                  raw: {
                    x: '2026-01-03',
                    y: bar.datasetIndex === 0 ? (props.chartData?.datasets[0]?.data[0] ?? 42) : 33,
                  },
                  dataset: { label: 'visitors' },
                },
              ],
            }
          : { opacity: 0 },
      });
    };

    return (
      <canvas
        data-test="chart-canvas"
        onPointerDownCapture={props.onPointerDownCapture}
        onPointerMoveCapture={props.onPointerMoveCapture}
        onTouchStartCapture={props.onTouchStartCapture}
        onTouchMoveCapture={props.onTouchMoveCapture}
        onTouchCancelCapture={props.onTouchCancelCapture}
        onTouchStart={event => showTooltip(event.touches[0])}
        onTouchMove={event => showTooltip(event.touches[0])}
        onMouseMove={showTooltip}
        onClick={event => {
          // Chart.js skips onClick for the axis but still processes clicks on plot whitespace.
          if (event.clientY < 200) {
            props.chartOptions.onClick?.({ native: event.nativeEvent }, hitTest(event));
          }
          showTooltip(event);
        }}
      />
    );
  },
}));

function tap(canvas: HTMLElement, clientX = 100, clientY = 150) {
  fireEvent.touchStart(canvas, { touches: [{ clientX, clientY }] });
  fireEvent.touchEnd(canvas, { touches: [] });
  fireEvent.click(canvas, { clientX, clientY });
}

beforeEach(() => {
  chartProps.current = null;
});

afterEach(cleanup);

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

test('a touch shows the value before a second tap drills into the same bar', () => {
  const onBarClick = vi.fn();
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  const canvas = screen.getByTestId('chart-canvas');
  tap(canvas);

  expect(onBarClick).not.toHaveBeenCalled();
  expect(screen.getByRole('tooltip').textContent).toContain('42 visitors');

  tap(canvas);

  expect(onBarClick).toHaveBeenCalledOnce();
  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 0, 3));
  expect(screen.queryByRole('tooltip')).toBeNull();
});

test('touching a different bar or empty space requires a new first tap', () => {
  const onBarClick = vi.fn();
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  const canvas = screen.getByTestId('chart-canvas');
  tap(canvas);
  tap(canvas, 220);
  tap(canvas, 100, 190);
  expect(screen.queryByRole('tooltip')).toBeNull();
  tap(canvas, 220);

  expect(onBarClick).not.toHaveBeenCalled();
});

test.each(['axis', 'outside', 'cancel', 'drag', 'scroll'])(
  'dismisses a touch selection on %s',
  action => {
    const onBarClick = vi.fn();
    render(
      <BarChart
        unit="day"
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 0, 31)}
        onBarClick={onBarClick}
      />,
    );

    const canvas = screen.getByTestId('chart-canvas');
    tap(canvas);

    if (action === 'axis') tap(canvas, 100, 220);
    if (action === 'outside') fireEvent.touchStart(document.body);
    if (action === 'scroll') fireEvent.scroll(document);
    if (action === 'cancel' || action === 'drag') {
      fireEvent.touchStart(canvas, { touches: [{ clientX: 100, clientY: 150 }] });
    }
    if (action === 'cancel') fireEvent.touchCancel(canvas);
    if (action === 'drag') {
      fireEvent.touchMove(canvas, { touches: [{ clientX: 100, clientY: 170 }] });
    }

    expect(screen.queryByRole('tooltip')).toBeNull();
    // A delayed click from a canceled or dismissed touch must not reselect the old bar.
    fireEvent.click(canvas, { clientX: 100, clientY: 150 });
    expect(screen.queryByRole('tooltip')).toBeNull();
    tap(canvas);
    expect(onBarClick).not.toHaveBeenCalled();
    expect(screen.getByRole('tooltip').textContent).toContain('42 visitors');
  },
);

test('dismisses the old value and selection when chart data changes', () => {
  const onBarClick = vi.fn();
  const props = {
    unit: 'day',
    minDate: new Date(2026, 0, 1),
    maxDate: new Date(2026, 0, 31),
    onBarClick,
  };
  const { rerender } = render(<BarChart {...props} chartData={{ datasets: [] }} />);
  const canvas = screen.getByTestId('chart-canvas');
  tap(canvas);

  rerender(<BarChart {...props} chartData={{ datasets: [{ data: [63] }] }} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  tap(canvas);
  expect(onBarClick).not.toHaveBeenCalled();
  expect(screen.getByRole('tooltip').textContent).toContain('63 visitors');
});

test('mouse hover after touch restores floating position and immediate clicks', async () => {
  const onBarClick = vi.fn();
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={onBarClick}
    />,
  );

  const canvas = screen.getByTestId('chart-canvas');
  tap(canvas);
  fireEvent.mouseMove(canvas, { clientX: 100, clientY: 150 });
  expect(screen.getByRole('tooltip').style.visibility).toBe('visible');

  fireEvent.pointerMove(canvas, { pointerType: 'mouse', clientX: 220, clientY: 120 });
  fireEvent.mouseMove(canvas, { clientX: 220, clientY: 120 });
  await waitFor(() => expect(screen.getByRole('tooltip').style.left).toBe('220px'));
  expect(screen.getByRole('tooltip').textContent).toContain('33 visitors');
  fireEvent.click(canvas, { clientX: 220, clientY: 120 });
  expect(onBarClick).toHaveBeenCalledOnce();
  expect(onBarClick).toHaveBeenCalledWith(new Date(2026, 0, 3));
});

test('keeps a touch tooltip visible at the edge of the viewport', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 240,
    height: 80,
  } as DOMRect);
  render(
    <BarChart
      unit="day"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 0, 31)}
      onBarClick={vi.fn()}
    />,
  );

  const canvas = screen.getByTestId('chart-canvas');
  fireEvent.touchStart(canvas, { touches: [{ clientX: 10, clientY: 20 }] });
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.style.left).toBe('8px');
  expect(tooltip.style.top).toBe('8px');
  expect(tooltip.style.visibility).toBe('visible');
  measure.mockRestore();
});

test('keeps a touch tooltip in view when the viewport narrows', () => {
  const originalWidth = window.innerWidth;
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 240,
    height: 80,
  } as DOMRect);
  try {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 740 });
    render(<BarChart unit="day" minDate={new Date(2026, 0, 1)} maxDate={new Date(2026, 0, 31)} />);
    fireEvent.touchStart(screen.getByTestId('chart-canvas'), {
      touches: [{ clientX: 700, clientY: 150 }],
    });
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.left).toBe('492px');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    fireEvent.resize(window);
    expect(tooltip.style.left).toBe('72px');
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
    measure.mockRestore();
  }
});
