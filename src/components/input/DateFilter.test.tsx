import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { DateFilter } from './DateFilter';

vi.mock('@/components/hooks', () => ({
  useLocale: () => ({ locale: 'en-US' }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: new Proxy({}, { get: (_, key) => String(key) }),
  }),
  useMobile: () => ({ isMobile: false }),
}));

test('renders an invalid custom range without crashing', () => {
  render(<DateFilter value="range:NaN:1767225600000" onChange={vi.fn()} />);

  expect(screen.getByRole('combobox')).toBeInTheDocument();
});
