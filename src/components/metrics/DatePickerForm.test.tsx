import { fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { DatePickerForm } from './DatePickerForm';

describe('DatePickerForm', () => {
  test('disables Apply button when startDate is after endDate', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DatePickerForm
        startDate={new Date(2026, 0, 20)}
        endDate={new Date(2026, 0, 10)}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).toBeDisabled();

    fireEvent.click(applyButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('calls onChange with valid range timestamps without NaN when valid dates are selected', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const start = new Date(2026, 0, 10);
    const end = new Date(2026, 0, 20);

    render(
      <DatePickerForm startDate={start} endDate={end} onChange={onChange} onClose={onClose} />,
    );

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).not.toBeDisabled();

    fireEvent.click(applyButton);
    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(emitted.startsWith('range:')).toBe(true);
    expect(emitted).not.toContain('NaN');
  });

  test('safely falls back to valid dates without emitting NaN when passed invalid Date instances', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DatePickerForm
        startDate={new Date(NaN)}
        endDate={new Date(NaN)}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(emitted.startsWith('range:')).toBe(true);
    expect(emitted).not.toContain('NaN');
  });
  test('clicking an already-selected day preserves a valid date selection and does not emit NaN', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const start = new Date(2026, 0, 10);
    const end = new Date(2026, 0, 20);

    render(
      <DatePickerForm startDate={start} endDate={end} onChange={onChange} onClose={onClose} />,
    );

    // Find selected day buttons in the calendar grids (aria-selected="true")
    const selectedDays = screen.getAllByRole('gridcell', { selected: true });
    expect(selectedDays.length).toBeGreaterThan(0);

    // Clicking the already selected start day should not deselect it because required is set
    fireEvent.click(selectedDays[0]);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).not.toBeDisabled();

    fireEvent.click(applyButton);
    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(emitted.startsWith('range:')).toBe(true);
    expect(emitted).not.toContain('NaN');
  });

  test('two clicks inside an existing range select a new range from the first to the second', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <DatePickerForm
        startDate={new Date(2026, 0, 10)}
        endDate={new Date(2026, 0, 20)}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const clickDay = (day: string) =>
      fireEvent.click(container.querySelector(`[data-day="${day}"] button`));

    clickDay('2026-01-15');
    clickDay('2026-01-18');
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onChange).toHaveBeenCalledWith(
      `range:${new Date(2026, 0, 15).getTime()}:${new Date(2026, 0, 18, 23, 59, 59, 999).getTime()}`,
    );
  });

  test('applying after a single click selects just that day', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <DatePickerForm
        startDate={new Date(2026, 0, 10)}
        endDate={new Date(2026, 0, 20)}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    fireEvent.click(container.querySelector('[data-day="2026-01-15"] button'));
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onChange).toHaveBeenCalledWith(
      `range:${new Date(2026, 0, 15).getTime()}:${new Date(2026, 0, 15, 23, 59, 59, 999).getTime()}`,
    );
  });

  test('highlights each day of a range crossing a month boundary only once', () => {
    const { container } = render(
      <DatePickerForm
        startDate={new Date(2025, 11, 29)}
        endDate={new Date(2026, 0, 2)}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const selectedDays = [
      ...container.querySelectorAll('[aria-selected="true"]:not([data-hidden])'),
    ].map(cell => cell.getAttribute('data-day'));

    expect(selectedDays).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ]);
  });

  test('opens on the current month when the range ends in the future', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 1, 15));

    const { container } = render(
      <DatePickerForm
        startDate={new Date(2026, 0, 1)}
        endDate={new Date(2026, 11, 31)}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const captions = [...container.querySelectorAll('.rdp-caption_label')].map(
      caption => caption.textContent,
    );
    vi.useRealTimers();

    expect(captions).toEqual(['January 2026', 'February 2026']);
  });

  test('does not disable Apply button when endDate matches maxDate calendar day', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const start = new Date(2026, 0, 10);
    const end = new Date(2026, 0, 20, 23, 59, 59, 999);
    const maxDate = new Date(2026, 0, 20, 12, 0, 0, 0);

    render(
      <DatePickerForm
        startDate={start}
        endDate={end}
        maxDate={maxDate}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).not.toBeDisabled();

    fireEvent.click(applyButton);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
