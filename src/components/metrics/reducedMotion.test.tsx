import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { ListTable } from './ListTable';
import { MetricCard } from './MetricCard';
import { PerformanceCard } from './PerformanceCard';

const preference = { reduced: true };

beforeEach(() => {
  preference.reduced = true;
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)' && preference.reduced,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

test('shows the final metric and percentage immediately with reduced motion', () => {
  const { rerender } = render(
    <MetricCard value={120} change={20} showChange formatValue={n => `${n} visits`} />,
  );
  expect(screen.getByText('120 visits')).toBeInTheDocument();
  expect(screen.getByText('20%')).toBeInTheDocument();
  rerender(<MetricCard value={180} change={60} showChange formatValue={n => `${n} visits`} />);
  expect(screen.getByText('180 visits')).toBeInTheDocument();
  expect(screen.getByText('50%')).toBeInTheDocument();
});

test('updates performance values without intermediate numbers', () => {
  const { rerender } = render(
    <PerformanceCard metric="lcp" value={1200} label="LCP" formatValue={n => `${n} ms`} />,
  );
  expect(screen.getByText('1200 ms')).toBeInTheDocument();
  rerender(<PerformanceCard metric="lcp" value={1800} label="LCP" formatValue={n => `${n} ms`} />);
  expect(screen.getByText('1800 ms')).toBeInTheDocument();
});

test('shows final list counts and percentages with reduced motion', () => {
  const { rerender } = render(
    <ListTable
      data={[{ label: 'Home', count: 42, percent: 75 }]}
      formatCount={n => `${n} views`}
    />,
  );
  expect(screen.getByText('42 views')).toBeInTheDocument();
  expect(screen.getByText('75%')).toBeInTheDocument();
  rerender(
    <ListTable
      data={[{ label: 'Home', count: 84, percent: 50 }]}
      formatCount={n => `${n} views`}
    />,
  );
  expect(screen.getByText('84 views')).toBeInTheDocument();
  expect(screen.getByText('50%')).toBeInTheDocument();
});

test('retains the animated metric path without a reduced-motion preference', () => {
  preference.reduced = false;
  render(<MetricCard value={120} formatValue={n => `${n} visits`} />);
  expect(screen.getByText('0 visits')).toBeInTheDocument();
});

test('still honors the explicit list animation opt-out', () => {
  preference.reduced = false;
  render(
    <ListTable
      animate={false}
      data={[{ label: 'Home', count: 42, percent: 75 }]}
      formatCount={n => `${n} views`}
    />,
  );
  expect(screen.getByText('42 views')).toBeInTheDocument();
  expect(screen.getByText('75%')).toBeInTheDocument();
});
