import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { expect, test } from 'vitest';
import enUS from '../../../public/intl/messages/en-US.json';
import { useMessages } from './useMessages';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en-US" messages={enUS}>
      {children}
    </NextIntlClientProvider>
  );
}

function apiError(message: string, code: string) {
  return Object.assign(new Error(message), { code });
}

test('translates an API error code that has a message', () => {
  const { result } = renderHook(() => useMessages(), { wrapper });

  const error = apiError('Unauthorized', 'unauthorized');

  expect(result.current.getErrorMessage(error)).toBe(enUS.message.unauthorized);
});

test('falls back to the error message when the code has no translation', () => {
  const { result } = renderHook(() => useMessages(), { wrapper });

  const error = apiError('Server error', 'server-error');

  expect(result.current.getErrorMessage(error)).toBe('Server error');
});
