'use client';
import { useRef, ClipboardEvent, KeyboardEvent } from 'react';
import {Row, TextField} from '@umami/react-zen';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

const LENGTH = 6;

const focusInput = (el: HTMLDivElement | null) => el?.querySelector('input')?.focus();

export function OtpInput({ value, onChange, onComplete, disabled }: OtpInputProps) {
  const digits = Array.from({ length: LENGTH }, (_, i) => value?.[i] ?? '');
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const update = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    const newVal = next.join('');
    onChange(newVal);
    if (newVal.length === LENGTH) {
      onComplete?.(newVal);
    }
  };

  const handleInput = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    if (!char) return;
    update(index, char);
    if (index < LENGTH - 1) {
      focusInput(refs.current[index + 1]);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        update(index, '');
      } else if (index > 0) {
        update(index - 1, '');
        focusInput(refs.current[index - 1]);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(refs.current[index - 1]);
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      focusInput(refs.current[index + 1]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? '');
    const newVal = next.join('');
    onChange(newVal);
    if (newVal.length === LENGTH) {
      onComplete?.(newVal);
      focusInput(refs.current[LENGTH - 1]);
    } else {
      focusInput(refs.current[pasted.length]);
    }
  };

  return (
    <Row gap='2'>
      {digits.map((digit, i) => (
        <div
          key={i}
          ref={el => {
            refs.current[i] = el;
          }}
        >
          <TextField
            value={digit}
            onChange={char => handleInput(i, char)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            isDisabled={disabled}
            inputMode="numeric"
            maxLength={1}
            autoComplete="one-time-code"
            aria-label={`Digit ${i + 1}`}
            placeholder="0"
            style={{width: 32}}
          />
        </div>
      ))}
    </Row>
  );
}
