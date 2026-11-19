import { z } from 'zod';
import { McpToolError } from './errors';

export const isoTimestamp = z
  .string()
  .min(4)
  .describe('ISO 8601 date or timestamp, e.g. "2024-05-01" or "2024-05-01T00:00:00Z".');

export const timeUnit = z
  .enum(['minute', 'hour', 'day', 'month', 'year'])
  .describe(
    'Bucket size for time series. If the unit is too fine for the range, the API uses the smallest allowed unit.',
  );

export const timezone = z
  .string()
  .describe('IANA timezone such as "America/Los_Angeles". Defaults to UTC.');

export const dateRangeInput = {
  startAt: isoTimestamp.describe('Start of the range (inclusive), ISO 8601.'),
  endAt: isoTimestamp
    .optional()
    .describe('End of the range (inclusive), ISO 8601. Defaults to now.'),
};

export function parseTimestamp(value: string, name: string): number {
  const ms = Date.parse(value);

  if (Number.isNaN(ms)) {
    throw new McpToolError(
      'invalid_date',
      `"${name}" is not a valid ISO 8601 date: ${JSON.stringify(value)}. Use a value like 2024-05-01 or 2024-05-01T00:00:00Z.`,
    );
  }

  return ms;
}

export interface DateRange {
  startAt: number;
  endAt: number;
}

export function parseDateRange(input: { startAt: string; endAt?: string }): DateRange {
  const startAt = parseTimestamp(input.startAt, 'startAt');
  const endAt = input.endAt ? parseTimestamp(input.endAt, 'endAt') : Date.now();

  if (endAt <= startAt) {
    throw new McpToolError(
      'invalid_date_range',
      `"endAt" (${new Date(endAt).toISOString()}) must be after "startAt" (${new Date(startAt).toISOString()}).`,
    );
  }

  return { startAt, endAt };
}

export function toIso(value: number | string | Date | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Report endpoints take `startDate`/`endDate` ISO strings instead of millisecond timestamps.
 */
export function toReportDates(range: DateRange) {
  return {
    startDate: new Date(range.startAt).toISOString(),
    endDate: new Date(range.endAt).toISOString(),
  };
}
