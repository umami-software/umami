import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CLICKHOUSE_DATE_FORMATS } from './clickhouse';

const createClient = vi.hoisted(() => vi.fn((_options: unknown) => ({})));

vi.mock('@clickhouse/client', () => ({ createClient }));

async function connect(maxOpenConnections?: string, enabled = true) {
  vi.stubEnv(
    'CLICKHOUSE_URL',
    enabled ? 'http://default:password@localhost:8123/umami' : undefined,
  );
  vi.stubEnv('CLICKHOUSE_MAX_OPEN_CONNECTIONS', maxOpenConnections);
  vi.stubEnv('NODE_ENV', 'production');

  vi.resetModules();

  const { default: clickhouse } = await import('./clickhouse');

  return clickhouse.connect();
}

beforeEach(() => {
  createClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('CLICKHOUSE_DATE_FORMATS', () => {
  test('uses date format tokens compatible with ClickHouse 22.8 and newer', () => {
    expect(CLICKHOUSE_DATE_FORMATS).toMatchObject({
      utc: '%Y-%m-%dT%TZ',
      second: '%Y-%m-%dT%T',
      minute: '%Y-%m-%d %R:00',
    });
  });
});

describe('ClickHouse connection limit', () => {
  test('uses the client default when CLICKHOUSE_MAX_OPEN_CONNECTIONS is unset', async () => {
    await connect();

    expect(createClient).toHaveBeenCalledOnce();
    expect(createClient.mock.calls[0][0]).not.toHaveProperty('max_open_connections');
  });

  test('sets max_open_connections from CLICKHOUSE_MAX_OPEN_CONNECTIONS', async () => {
    await connect('25');

    expect(createClient.mock.calls[0][0]).toHaveProperty('max_open_connections', 25);
  });

  test('ignores CLICKHOUSE_MAX_OPEN_CONNECTIONS when ClickHouse is disabled', async () => {
    await expect(connect('invalid', false)).resolves.toBeUndefined();
    expect(createClient).not.toHaveBeenCalled();
  });

  test.each(['', '0', '-1', '1.5', 'ten', '10connections', '9007199254740992'])(
    'rejects invalid CLICKHOUSE_MAX_OPEN_CONNECTIONS value %j',
    async value => {
      await expect(connect(value)).rejects.toThrow(
        'CLICKHOUSE_MAX_OPEN_CONNECTIONS must be a positive integer.',
      );
      expect(createClient).not.toHaveBeenCalled();
    },
  );
});
