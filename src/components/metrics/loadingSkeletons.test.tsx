import { expect, test } from 'vitest';
import { Chart } from '@/components/charts/Chart';
import { render, screen } from '@/test/render';
import { ListTable } from './ListTable';
import { MetricCard } from './MetricCard';

test('keeps the metric label while the value loads', () => {
  // The label is known before the data, so only the number is a placeholder.
  render(<MetricCard value={0} label="Visitors" showChange loading />);

  expect(screen.getByText('Visitors')).toBeInTheDocument();
  expect(screen.getByTestId('metric-skeleton')).toBeInTheDocument();
  expect(screen.queryByText('0')).not.toBeInTheDocument();
});

test('shows the metric value once loaded', () => {
  render(<MetricCard value={42} label="Visitors" formatValue={String} />);

  expect(screen.queryByTestId('metric-skeleton')).not.toBeInTheDocument();
});

test('shows placeholder rows under the list header while loading', () => {
  render(<ListTable title="Path" metric="Visitors" loading loadingRows={4} />);

  expect(screen.getByText('Path')).toBeInTheDocument();
  expect(screen.getAllByTestId('list-skeleton-row')).toHaveLength(4);
  // An empty list while loading is not "no data".
  expect(screen.queryByText(/no data/i)).not.toBeInTheDocument();
});

test('replaces the plot but keeps the legend while a chart loads', () => {
  render(
    <Chart legendItems={[{ text: 'Views', color: '#000' }]} loading>
      <div>plot</div>
    </Chart>,
  );

  expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  expect(screen.queryByText('plot')).not.toBeInTheDocument();
  expect(screen.getByText('Views')).toBeInTheDocument();
});
