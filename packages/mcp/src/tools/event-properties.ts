import { z } from 'zod';
import { dateRangeInput, parseDateRange } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

const DATA_TYPES: Record<number, string> = {
  1: 'string',
  2: 'number',
  3: 'boolean',
  4: 'date',
  5: 'array',
};

const dataTypeInput = z
  .enum(['string', 'number', 'boolean', 'date', 'array'])
  .describe('Restrict to properties of this data type.');

function toDataTypeCode(value?: string) {
  if (!value) {
    return undefined;
  }

  const entry = Object.entries(DATA_TYPES).find(([, name]) => name === value);

  return entry ? Number(entry[0]) : undefined;
}

interface PropertyRow {
  eventName?: string;
  propertyName?: string;
  dataType?: number;
  total?: number;
}

interface ValueRow {
  value?: string;
  total?: number;
}

interface StatsRow {
  events?: number;
  properties?: number;
  records?: number;
}

export const getEventProperties = defineTool({
  name: 'get_event_properties',
  title: 'Get custom event properties and values',
  description:
    'Explores the custom data attached to tracked events (e.g. { plan: "pro", amount: 49 } sent with a "checkout" event). ' +
    'Without "propertyName": lists every property name seen on custom events in the range, with its event name, data type and ' +
    'how many times it was recorded, plus overall totals. ' +
    'With "propertyName": returns the distinct values of that property ranked by frequency (top 100), optionally restricted to one ' +
    'event name. Use this for questions like "which plans do people choose?" or "what search terms are used most?". ' +
    'Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    propertyName: z
      .string()
      .min(1)
      .optional()
      .describe('Property to get values for. Omit to list available properties first.'),
    eventName: z
      .string()
      .min(1)
      .optional()
      .describe('Only consider this custom event name, e.g. "checkout".'),
    dataType: dataTypeInput.optional(),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const filters = toFilterParams(input.filters);
    const common = {
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      ...filters,
    };
    const base = {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
    };

    if (input.propertyName) {
      const rows = (await client.getEventDataValues({
        ...common,
        propertyName: input.propertyName,
        eventName: input.eventName,
        dataType: toDataTypeCode(input.dataType),
      })) as ValueRow[];

      return {
        ...base,
        propertyName: input.propertyName,
        eventName: input.eventName ?? null,
        values: (Array.isArray(rows) ? rows : []).map(row => ({
          value: row.value ?? null,
          count: Number(row.total ?? 0),
        })),
      };
    }

    const propertyParams = input.eventName ? { ...common, event: input.eventName } : common;
    const [rows, stats] = await Promise.all([
      client.getEventDataProperties(propertyParams) as Promise<PropertyRow[]>,
      client.getEventDataStats(propertyParams) as Promise<StatsRow>,
    ]);

    const wanted = toDataTypeCode(input.dataType);
    const properties = (Array.isArray(rows) ? rows : [])
      .filter(row => wanted === undefined || row.dataType === wanted)
      .map(row => ({
        eventName: row.eventName ?? null,
        propertyName: row.propertyName ?? null,
        dataType: DATA_TYPES[row.dataType ?? 0] ?? String(row.dataType ?? 'unknown'),
        count: Number(row.total ?? 0),
      }));

    return {
      ...base,
      eventName: input.eventName ?? null,
      totals: {
        events: Number(stats?.events ?? 0),
        properties: Number(stats?.properties ?? 0),
        records: Number(stats?.records ?? 0),
      },
      properties,
    };
  },
});
