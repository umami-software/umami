import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import kafka from './kafka';

const mocks = vi.hoisted(() => ({
  Kafka: vi.fn(),
  send: vi.fn(),
}));

vi.mock('kafkajs', () => ({
  Kafka: mocks.Kafka,
  logLevel: { ERROR: 1 },
}));

const EVENT_HUBS_CONNECTION_STRING =
  'Endpoint=sb://my-ns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=abc+def/ghi=';

function buildUrl(username: string, password: string, host = 'broker.example.com:9093') {
  return `kafka://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}`;
}

describe('getCredentials', () => {
  test('returns plain credentials unchanged', () => {
    expect(kafka.getCredentials('kafka://user:secret@localhost:9092')).toEqual({
      username: 'user',
      password: 'secret',
    });
  });

  test('returns empty strings when the URL has no credentials', () => {
    expect(kafka.getCredentials('kafka://localhost:9092')).toEqual({ username: '', password: '' });
  });

  test('decodes an Azure Event Hubs connection string used as password', () => {
    const url = buildUrl(
      '$ConnectionString',
      EVENT_HUBS_CONNECTION_STRING,
      'my-ns.servicebus.windows.net:9093',
    );

    expect(kafka.getCredentials(url)).toEqual({
      username: '$ConnectionString',
      password: EVENT_HUBS_CONNECTION_STRING,
    });
  });

  test('round-trips reserved and non-ASCII characters', () => {
    const password = 'p@ss:w/rd=+;%?#& é日本';

    expect(kafka.getCredentials(buildUrl('us:er@x', password)).password).toBe(password);
    expect(kafka.getCredentials(buildUrl('us:er@x', password)).username).toBe('us:er@x');
  });

  test('does not turn "+" into a space', () => {
    expect(kafka.getCredentials('kafka://user:a+b@localhost:9092').password).toBe('a+b');
  });

  test.each(['100%sure', 'pa%zz', 'trailing%'])(
    'falls back to the raw value when "%s" is not valid percent-encoding',
    password => {
      expect(kafka.getCredentials(`kafka://user:${password}@localhost:9092`).password).toBe(
        password,
      );
    },
  );
});

describe('Kafka client configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    // kafka.ts caches the client on globalThis outside production
    delete (globalThis as Record<string, unknown>).kafka;
    delete (globalThis as Record<string, unknown>)['kafka-producer'];

    mocks.Kafka.mockReset();
    mocks.send.mockReset();
    mocks.send.mockResolvedValue([]);
    mocks.Kafka.mockImplementation(() => ({
      producer: () => ({ connect: vi.fn(), send: mocks.send }),
    }));

    vi.stubEnv('KAFKA_BROKER', 'broker.example.com:9093');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('passes decoded SASL credentials to the Kafka client', async () => {
    vi.stubEnv(
      'KAFKA_URL',
      buildUrl(
        '$ConnectionString',
        EVENT_HUBS_CONNECTION_STRING,
        'my-ns.servicebus.windows.net:9093',
      ),
    );

    const { default: reloaded } = await import('./kafka');
    await reloaded.sendMessage('event', { a: 1 });

    expect(mocks.Kafka).toHaveBeenCalledTimes(1);
    expect(mocks.Kafka.mock.calls[0][0].sasl).toMatchObject({
      mechanism: 'plain',
      username: '$ConnectionString',
      password: EVENT_HUBS_CONNECTION_STRING,
    });
  });

  test('does not configure SASL when the URL has no credentials', async () => {
    vi.stubEnv('KAFKA_URL', 'kafka://broker.example.com:9092');

    const { default: reloaded } = await import('./kafka');
    await reloaded.sendMessage('event', { a: 1 });

    expect(mocks.Kafka.mock.calls[0][0].sasl).toBeUndefined();
  });
});
