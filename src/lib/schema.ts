import { z } from 'zod';
import * as yup from 'yup';
import { isValidTimezone } from 'lib/date';
import { UNIT_TYPES } from './constants';

export const dateRange = {
  startAt: yup.number().integer().required(),
  endAt: yup.number().integer().min(yup.ref('startAt')).required(),
};

export const pageInfo = {
  query: yup.string(),
  page: yup.number().integer().positive(),
  pageSize: yup.number().integer().positive().min(1).max(200),
  orderBy: yup.string(),
};

export const pagingParams = {
  page: z.coerce.number().int().positive(),
  pageSize: z.coerce.number().int().positive(),
  orderBy: z.string().optional(),
  query: z.string().optional(),
};

export const timezoneParam = z.string().refine(value => isValidTimezone(value), {
  message: 'Invalid timezone',
});

export const unitParam = z.string().refine(value => UNIT_TYPES.includes(value), {
  message: 'Invalid unit',
});

export const roleParam = z.string().regex(/team-member|team-view-only|team-manager/);

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
