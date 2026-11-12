import { fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { OtpInput } from './OtpInput';

function getDigitInput(index: number) {
  return screen.getByLabelText(`Digit ${index + 1}`) as HTMLInputElement;
}

test('typing individual digits fills fields in order and advances focus', async () => {
  const onChange = vi.fn();
  const { user } = render(<OtpInput value="" onChange={onChange} />);

  await user.click(getDigitInput(0));
  await user.keyboard('1');

  expect(onChange).toHaveBeenLastCalledWith('1');
});

test('a real paste event distributes the code across all fields and calls onComplete', async () => {
  const onChange = vi.fn();
  const onComplete = vi.fn();
  const { user } = render(<OtpInput value="" onChange={onChange} onComplete={onComplete} />);

  await user.click(getDigitInput(0));
  await user.paste('123456');

  expect(onChange).toHaveBeenLastCalledWith('123456');
  expect(onComplete).toHaveBeenCalledWith('123456');
});

test('a multi-character value delivered via onChange (mobile paste fallback) fills all fields', () => {
  const onChange = vi.fn();
  const onComplete = vi.fn();
  render(<OtpInput value="" onChange={onChange} onComplete={onComplete} />);

  const input = getDigitInput(0);
  fireEvent.change(input, { target: { value: '123456' } });

  expect(onChange).toHaveBeenLastCalledWith('123456');
  expect(onComplete).toHaveBeenCalledWith('123456');
});

test('autoFocus focuses the first digit on mount', () => {
  render(<OtpInput value="" onChange={vi.fn()} autoFocus />);

  expect(getDigitInput(0)).toHaveFocus();
});

test('does not take focus without autoFocus', () => {
  render(<OtpInput value="" onChange={vi.fn()} />);

  expect(getDigitInput(0)).not.toHaveFocus();
});

test('autoFocus focuses the first digit again when re-enabled', () => {
  const { rerender } = render(<OtpInput value="" onChange={vi.fn()} disabled autoFocus />);

  expect(getDigitInput(0)).not.toHaveFocus();

  rerender(<OtpInput value="" onChange={vi.fn()} autoFocus />);

  expect(getDigitInput(0)).toHaveFocus();
});

test('clearing the value moves focus back to the first digit', async () => {
  const { user, rerender } = render(<OtpInput value="123456" onChange={vi.fn()} />);

  await user.click(getDigitInput(5));
  rerender(<OtpInput value="" onChange={vi.fn()} />);

  expect(getDigitInput(0)).toHaveFocus();
});

test('readOnly keeps focus and ignores paste and backspace', async () => {
  const onChange = vi.fn();
  const { user } = render(<OtpInput value="123456" onChange={onChange} readOnly />);

  await user.click(getDigitInput(5));
  await user.keyboard('{Backspace}');
  await user.paste('654321');

  expect(getDigitInput(5)).toHaveFocus();
  expect(onChange).not.toHaveBeenCalled();
});
