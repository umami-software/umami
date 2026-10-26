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
});
