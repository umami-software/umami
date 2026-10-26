import { describe, expect, test } from 'vitest';
import { render } from '@/test/render';
import { DateDisplay } from './DateDisplay';

describe('DateDisplay', () => {
  test('returns null when startDate or endDate is missing or invalid', () => {
    const { container: c1 } = render(<DateDisplay startDate={undefined} endDate={undefined} />);
    expect(c1.querySelector('span')).toBeNull();
    expect(c1.textContent).toBe('');

    const { container: c2 } = render(
      <DateDisplay startDate={new Date(NaN)} endDate={new Date()} />,
    );
    expect(c2.querySelector('span')).toBeNull();
    expect(c2.textContent).toBe('');

    const { container: c3 } = render(
      <DateDisplay startDate={new Date()} endDate={new Date(NaN)} />,
    );
    expect(c3.querySelector('span')).toBeNull();
    expect(c3.textContent).toBe('');
  });

  test('renders formatted date for valid dates', () => {
    const start = new Date(2026, 0, 15);
    const end = new Date(2026, 0, 20);
    const { container } = render(<DateDisplay startDate={start} endDate={end} />);

    expect(container.textContent).toContain('Jan 15, 2026');
    expect(container.textContent).toContain('Jan 20, 2026');
  });

  test('renders single date when startDate and endDate are the same day', () => {
    const start = new Date(2026, 0, 15, 8, 0, 0);
    const end = new Date(2026, 0, 15, 18, 0, 0);
    const { container } = render(<DateDisplay startDate={start} endDate={end} />);

    expect(container.textContent).toBe('Jan 15, 2026');
  });
});
