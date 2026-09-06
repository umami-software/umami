import { getItem, removeItem, setItem } from '@/lib/storage';

const RETURN_URL = 'umami.return-url';

/** Only same-origin relative paths are accepted to prevent open redirects. */
export function isSafeReturnUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/\\') &&
    !/[\r\n]/.test(value)
  );
}

export function setReturnUrl(url: string) {
  if (isSafeReturnUrl(url)) {
    setItem(RETURN_URL, url, true);
  }
}

export function consumeReturnUrl(): string | null {
  const value = getItem(RETURN_URL, true);

  removeItem(RETURN_URL, true);

  return isSafeReturnUrl(value) ? value : null;
}
