import { z } from 'zod';
import { isValidTimezone } from '@/lib/date';
import { UNIT_TYPES } from './constants';

export const filterParams = {
  url: z.string().optional(),
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
  host: z.string().optional(),
  language: z.string().optional(),
  event: z.string().optional(),
};

export const pagingParams = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  orderBy: z.string().optional(),
  search: z.string().optional(),
};

export const timezoneParam = z.string().refine(value => isValidTimezone(value), {
  message: 'Invalid timezone',
});

export const unitParam = z.string().refine(value => UNIT_TYPES.includes(value), {
  message: 'Invalid unit',
});

export const userRoleParam = z.enum(['admin', 'user', 'view-only']);

export const teamRoleParam = z.enum(['team-member', 'team-view-only', 'team-manager']);

export const anyObjectParam = z.object({}).passthrough();

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

export const reportTypeParam = z.enum([
  'funnel',
  'insight',
  'retention',
  'utm',
  'goal',
  'journey',
  'revenue',
  'attribution',
]);

export const reportParms = {
  websiteId: z.string().uuid(),
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    num: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    unit: z.string().optional(),
    value: z.string().optional(),
  }),
};

export const goalReportSchema = z.object({
  type: z.literal('goal'),
  parameters: z
    .object({
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
    window: z.coerce.number().positive(),
    steps: z
      .array(
        z.object({
          type: z.enum(['page', 'event']),
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
    steps: z.coerce.number().min(2).max(7),
    startStep: z.string().optional(),
    endStep: z.string().optional(),
  }),
});

export const retentionReportSchema = z.object({
  type: z.literal('retention'),
});

export const utmReportSchema = z.object({
  type: z.literal('utm'),
});

export const revenueReportSchema = z.object({
  type: z.literal('revenue'),
});

export const attributionReportSchema = z.object({
  type: z.literal('attribution'),
  parameters: z.object({
    model: z.enum(['first-click', 'last-click']),
    type: z.enum(['page', 'event']),
    step: z.string(),
    currency: z.string().optional(),
  }),
});

export const insightsReportSchema = z.object({
  type: z.literal('insights'),
});

export const reportBaseSchema = z.object({
  websiteId: z.string().uuid(),
  type: reportTypeParam,
  name: z.string().max(200),
  description: z.string().max(500).optional(),
});

export const reportTypeSchema = z.discriminatedUnion('type', [
  goalReportSchema,
  funnelReportSchema,
  journeyReportSchema,
  retentionReportSchema,
  utmReportSchema,
  revenueReportSchema,
  attributionReportSchema,
  insightsReportSchema,
]);

export const reportSchema = z.intersection(reportBaseSchema, reportTypeSchema);

export const reportResultSchema = z.intersection(
  z.object({
    ...reportParms,
    ...filterParams,
  }),
  reportTypeSchema,
);
