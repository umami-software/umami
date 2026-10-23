import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { DatePickerForm } from './DatePickerForm';

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      apply: 'Apply',
      cancel: 'Cancel',
      dateRange: 'Date range',
      singleDay: 'Single day',
    },
  }),
}));

test('keeps the selected range when a selected day is clicked again', async () => {
  const onChange = vi.fn();
  const startDate = new Date(2025, 2, 4);
  const endDate = new Date(2025, 2, 10);

  const { user } = render(
    <DatePickerForm
      startDate={startDate}
      endDate={endDate}
      minDate={new Date(2000, 0, 1)}
      maxDate={new Date(2030, 0, 1)}
      onChange={onChange}
      onClose={vi.fn()}
    />,
  );

  const selectedDays = screen.getAllByRole('button', { name: /selected/i });
  await user.click(selectedDays[0]);
  await user.click(selectedDays[1]);
  await user.click(screen.getByRole('button', { name: 'Apply' }));

  const [, start, end] = onChange.mock.calls[0][0].split(':');
  expect(Number(start)).toBe(startDate.getTime());
  expect(Number(end)).toBe(new Date(2025, 2, 10, 23, 59, 59, 999).getTime());
});
