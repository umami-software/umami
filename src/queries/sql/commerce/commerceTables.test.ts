import { beforeEach, expect, test, vi } from 'vitest';

const { rawQueryMock } = vi.hoisted(() => ({ rawQueryMock: vi.fn() }));

vi.mock('@/lib/clickhouse', () => ({ default: { rawQuery: rawQueryMock } }));

import {
  hasClickhouseCommerceTables,
  requireClickhouseCommerceTables,
  resetCommerceTablesCheck,
} from './commerceTables';

beforeEach(() => {
  rawQueryMock.mockReset();
  resetCommerceTablesCheck();
  vi.useRealTimers();
});

test('caches a positive check for the process', async () => {
  rawQueryMock.mockResolvedValue([{ tables: 2 }]);

  expect(await hasClickhouseCommerceTables()).toBe(true);
  expect(await hasClickhouseCommerceTables()).toBe(true);
  expect(rawQueryMock).toHaveBeenCalledTimes(1);
});

test('rechecks a negative answer after a minute, so migrating needs no restart', async () => {
  vi.useFakeTimers();
  rawQueryMock.mockResolvedValueOnce([{ tables: 1 }]).mockResolvedValueOnce([{ tables: 2 }]);

  expect(await hasClickhouseCommerceTables()).toBe(false);
  expect(await hasClickhouseCommerceTables()).toBe(false);
  expect(rawQueryMock).toHaveBeenCalledTimes(1);

  vi.advanceTimersByTime(61_000);
  expect(await hasClickhouseCommerceTables()).toBe(true);
});

test('names the migration to apply when tables are missing', async () => {
  rawQueryMock.mockResolvedValue([{ tables: 0 }]);

  await expect(requireClickhouseCommerceTables()).rejects.toThrow('15_add_commerce.sql');
});
