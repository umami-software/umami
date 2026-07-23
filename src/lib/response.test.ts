import { describe, expect, test, vi } from 'vitest';
import { serverError, withNoStore } from './response';

describe('serverError', () => {
  test('does not expose internal error details in the response body', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const response = serverError(new Error('database exploded'));

    expect(await response.json()).toEqual({
      error: {
        message: 'Server error',
        code: 'server-error',
        status: 500,
      },
    });

    logSpy.mockRestore();
  });

  test('allows intentional server error messages', async () => {
    const response = serverError('Redis is disabled');

    expect(await response.json()).toEqual({
      error: {
        message: 'Redis is disabled',
        code: 'server-error',
        status: 500,
      },
    });
  });
});

describe('withNoStore', () => {
  test('preserves the response while overriding a cacheable header with private no-store policy', async () => {
    const response = new Response(JSON.stringify({ error: 'invalid invitation' }), {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
        'X-Request-Id': 'request-1',
      },
    });

    const protectedResponse = withNoStore(response);

    expect(protectedResponse.status).toBe(400);
    expect(protectedResponse.statusText).toBe('Bad Request');
    expect(protectedResponse.headers.get('Content-Type')).toBe('application/json');
    expect(protectedResponse.headers.get('X-Request-Id')).toBe('request-1');
    expect(protectedResponse.headers.get('Cache-Control')).toBe('private, no-store, max-age=0');
    expect(await protectedResponse.text()).toBe(JSON.stringify({ error: 'invalid invitation' }));
  });
});
