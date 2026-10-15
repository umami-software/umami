import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/render';
import { ListTable } from './ListTable';
import { MetricCard } from './MetricCard';

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

test('a clickable metric card is a toggle button that responds to the keyboard', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<MetricCard value={1} label="LCP" onClick={onClick} selected />);
  const card = screen.getByRole('button', { pressed: true });
  await user.click(card);
  await user.keyboard('{Enter}');
  await user.keyboard(' ');
  expect(onClick).toHaveBeenCalledTimes(3);
});

test('a plain metric card is not interactive', () => {
  render(<MetricCard value={1} label="Visitors" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
