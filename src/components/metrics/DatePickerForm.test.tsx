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
