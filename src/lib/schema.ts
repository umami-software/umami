import { z } from 'zod';
import { isValidTimezone, normalizeTimezone } from '@/lib/date';
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
  segment: z.string().optional(),
  cohort: z.string().optional(),
};

export const pagingParams = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  orderBy: z.string().optional(),
  search: z.string().optional(),
};

export const timezoneParam = z.string().refine((value: string) => isValidTimezone(value), {
  message: 'Invalid timezone',
}).transform((value: string) => normalizeTimezone(value));

export const unitParam = z.string().refine(value => UNIT_TYPES.includes(value), {
  message: 'Invalid unit',
});

export const roleParam = z.enum(['team-member', 'team-view-only', 'team-manager']);

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
  'insights',
  'retention',
  'utm',
  'goals',
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

export const segmentTypeParam = z.enum(['segment', 'cohort']);
