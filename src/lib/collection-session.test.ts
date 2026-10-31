import { afterEach, describe, expect, test, vi } from 'vitest';
import { resolveCollectionSession } from './collection-session';

vi.hoisted(() => {
  process.env.APP_SECRET ??= 'test-app-secret';
});

const base = {
  sourceId: '2e2fc91f-77a7-4e5d-a7b1-18a74c67b4e0',
  ip: '192.0.2.1',
  userAgent: 'Desktop Browser',
  createdAt: new Date('2026-10-15T12:00:00Z'),
};

const sessionId = (overrides: Partial<Parameters<typeof resolveCollectionSession>[0]> = {}) =>
  resolveCollectionSession({ ...base, ...overrides }).sessionId;

afterEach(() => {
  delete process.env.ENABLE_CLIENT_SALT;
});

describe('client salt', () => {
  test('is ignored unless ENABLE_CLIENT_SALT is set', () => {
    expect(sessionId({ salt: '2026-10-15' })).toBe(sessionId());
  });

  describe('with ENABLE_CLIENT_SALT', () => {
    test('leaves unsalted session IDs unchanged', () => {
      const unsalted = sessionId();
      process.env.ENABLE_CLIENT_SALT = '1';

      expect(sessionId()).toBe(unsalted);
      expect(sessionId({ salt: '' })).toBe(unsalted);
    });

    test('keeps the same salt on the same session and splits different salts', () => {
      process.env.ENABLE_CLIENT_SALT = '1';

      expect(sessionId({ salt: '2026-10-15' })).toBe(sessionId({ salt: '2026-10-15' }));
      expect(sessionId({ salt: '2026-10-15' })).not.toBe(sessionId({ salt: '2026-10-16' }));
      expect(sessionId({ salt: '2026-10-15' })).not.toBe(sessionId());
    });

    test('still rotates when the server salt period rolls over', () => {
      process.env.ENABLE_CLIENT_SALT = '1';
      const salt = 'fixed-client-value';

      expect(sessionId({ salt })).not.toBe(
        sessionId({ salt, createdAt: new Date('2026-11-15T12:00:00Z') }),
      );
    });
  });
});
