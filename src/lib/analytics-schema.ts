import { z } from 'zod';
import {
  attributionReportSchema,
  breakdownReportSchema,
  filterParams,
  heatmapReportSchema,
  journeyReportSchema,
  timezoneParam,
  unitParam,
} from './schema';

// GET analytics have one authoritative timestamp range. Dynamic filters are retained by parseRequest.
export const analyticsParams = {
  ...filterParams,
  startAt: z.coerce.number().int().min(0).max(8640000000000000),
  endAt: z.coerce.number().int().min(0).max(8640000000000000),
  timezone: timezoneParam.optional(),
  unit: unitParam.optional(),
};

export function jsonQuery<T extends z.ZodType>(schema: T) {
  return z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON query parameter' });
        return z.NEVER;
      }
    })
    .pipe(schema);
}

export function analyticsSchema<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({ ...analyticsParams, ...shape })
    .refine((data: Record<string, unknown>) => Number(data.endAt) >= Number(data.startAt), {
      message: 'endAt must be greater than or equal to startAt',
      path: ['endAt'],
    });
}

export const journeyQuerySchema = analyticsSchema(
  journeyReportSchema.shape.parameters.omit({ startDate: true, endDate: true }).shape,
);
export const retentionQuerySchema = analyticsSchema({});
export const breakdownQuerySchema = analyticsSchema({
  fields: jsonQuery(breakdownReportSchema.shape.parameters.shape.fields),
});
export const attributionQuerySchema = analyticsSchema(
  attributionReportSchema.shape.parameters.omit({ startDate: true, endDate: true }).shape,
);
export const heatmapQuerySchema = analyticsSchema(
  heatmapReportSchema.shape.parameters.omit({ startDate: true, endDate: true }).shape,
);
