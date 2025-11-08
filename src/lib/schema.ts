import { z } from 'zod';
import { isValidTimezone, normalizeTimezone } from '@/lib/date';
import { UNIT_TYPES } from './constants';

export const timezoneParam = z
  .string()
  .refine((value: string) => isValidTimezone(value), {
    message: 'Invalid timezone',
  })
  .transform((value: string) => normalizeTimezone(value));

export const unitParam = z.string().refine(value => UNIT_TYPES.includes(value), {
  message: 'Invalid unit',
});

export const dateRangeParams = {
  startAt: z.coerce.number().optional(),
  endAt: z.coerce.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  timezone: timezoneParam.optional(),
  unit: unitParam.optional(),
  compare: z.string().optional(),
};

export const filterParams = {
  path: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
  query: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  tag: z.string().optional(),
  hostname: z.string().optional(),
  language: z.string().optional(),
  event: z.string().optional(),
  segment: z.uuid().optional(),
  cohort: z.uuid().optional(),
  eventType: z.coerce.number().int().positive().optional(),
};

export const searchParams = {
  search: z.string().optional(),
};

export const pagingParams = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
};

export const sortingParams = {
  orderBy: z.string().optional(),
};

export const userRoleParam = z.enum(['admin', 'user', 'view-only']);

export const teamRoleParam = z.enum(['team-member', 'team-view-only', 'team-manager']);

export const anyObjectParam = z.record(z.string(), z.any());

export const urlOrPathParam = z.string().refine(
  value => {
    try {
      new URL(value, 'https://localhost');
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid URL.',
  },
);

export const fieldsParam = z.enum([
  'path',
  'referrer',
  'title',
  'query',
  'os',
  'browser',
  'device',
  'country',
  'region',
  'city',
  'tag',
  'hostname',
  'language',
  'event',
]);

export const reportTypeParam = z.enum([
  'attribution',
  'breakdown',
  'funnel',
  'goal',
  'journey',
  'retention',
  'revenue',
  'utm',
]);

export const goalReportSchema = z.object({
  type: z.literal('goal'),
  parameters: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      type: z.string(),
      value: z.string(),
      operator: z.enum(['count', 'sum', 'average']).optional(),
      property: z.string().optional(),
    })
    .refine(data => {
      if (data['type'] === 'event' && data['property']) {
        return data['operator'] && data['property'];
      }
      return true;
    }),
});

export const funnelReportSchema = z.object({
  type: z.literal('funnel'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    window: z.coerce.number().positive(),
    steps: z
      .array(
        z.object({
          type: z.enum(['path', 'event']),
          value: z.string(),
        }),
      )
      .min(2)
      .max(8),
  }),
});

export const journeyReportSchema = z.object({
  type: z.literal('journey'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    steps: z.coerce.number().min(2).max(7),
    startStep: z.string().optional(),
    endStep: z.string().optional(),
  }),
});

export const retentionReportSchema = z.object({
  type: z.literal('retention'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    timezone: z.string().optional(),
  }),
});

export const utmReportSchema = z.object({
  type: z.literal('utm'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }),
});

export const revenueReportSchema = z.object({
  type: z.literal('revenue'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    timezone: z.string().optional(),
    currency: z.string(),
  }),
});

export const attributionReportSchema = z.object({
  type: z.literal('attribution'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    model: z.enum(['first-click', 'last-click']),
    type: z.enum(['path', 'event']),
    step: z.string(),
    currency: z.string().optional(),
  }),
});

export const breakdownReportSchema = z.object({
  type: z.literal('breakdown'),
  parameters: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    fields: z.array(fieldsParam),
  }),
});

export const reportBaseSchema = z.object({
  websiteId: z.uuid(),
  type: reportTypeParam,
  name: z.string().max(200),
  description: z.string().max(500).optional(),
  parameters: anyObjectParam,
});

export const reportTypeSchema = z.discriminatedUnion('type', [
  goalReportSchema,
  funnelReportSchema,
  journeyReportSchema,
  retentionReportSchema,
  utmReportSchema,
  revenueReportSchema,
  attributionReportSchema,
  breakdownReportSchema,
]);

export const reportSchema = reportBaseSchema;

export const reportResultSchema = z.intersection(
  z.object({
    websiteId: z.uuid(),
    filters: z.object({ ...filterParams }),
  }),
  reportTypeSchema,
);

export const segmentTypeParam = z.enum(['segment', 'cohort']);
