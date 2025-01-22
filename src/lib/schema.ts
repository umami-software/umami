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

export const timezone = z.string().refine(value => isValidTimezone(value), {
  message: 'Invalid timezone',
});

export const unit = z.string().refine(value => UNIT_TYPES.includes(value), {
  message: 'Invalid unit',
});
