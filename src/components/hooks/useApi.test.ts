import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { getClientAuthToken } from '@/lib/client';
import { httpGet } from '@/lib/fetch';
import { useApi } from './useApi';

vi.mock('@/store/app', () => ({
  useApp: (selector: (state: object) => unknown) => selector({}),
}));
vi.mock('@/lib/client', () => ({ getClientAuthToken: vi.fn() }));
vi.mock('@/lib/fetch', () => ({
  httpGet: vi.fn(async () => ({ ok: true, data: {} })),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('sends the current auth token from callbacks created before it changed', async () => {
  // Changing the password swaps the token while the dashboard stays mounted. Requests from
  // already-rendered components must use the new token, or the old one gets them a 401.
  vi.mocked(getClientAuthToken).mockReturnValue('old-token');
  const { get } = renderHook(() => useApi()).result.current;

  vi.mocked(getClientAuthToken).mockReturnValue('new-token');
  await get('/me');

  expect(httpGet).toHaveBeenCalledWith(
    expect.any(String),
    {},
    expect.objectContaining({ authorization: 'Bearer new-token' }),
  );
});
