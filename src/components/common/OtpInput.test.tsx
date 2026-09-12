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
