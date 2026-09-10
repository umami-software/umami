import { z } from 'zod';
import {
  attributionReportSchema,
  breakdownReportSchema,
  filterParams,
  funnelReportSchema,
  goalReportSchema,
  pagingParams,
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

export const funnelParametersSchema = funnelReportSchema.shape.parameters.omit({
  startDate: true,
  endDate: true,
});
export const goalParametersSchema = goalReportSchema.shape.parameters.omit({
  startDate: true,
  endDate: true,
});
export const funnelQuerySchema = analyticsSchema({
  ...funnelParametersSchema.shape,
  steps: jsonQuery(funnelParametersSchema.shape.steps),
});
export const goalQuerySchema = analyticsSchema(goalParametersSchema.shape);
export const savedStatsQuerySchema = analyticsSchema({});
export const definitionListSchema = z.object({ ...pagingParams, search: z.string().optional() });
export const funnelDefinitionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  parameters: funnelParametersSchema,
});
export const goalDefinitionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  parameters: goalParametersSchema,
});

export const performanceStatsQuerySchema = analyticsSchema({});
export const performanceChartQuerySchema = analyticsSchema({
  metric: z.enum(['lcp', 'inp', 'cls', 'fcp', 'ttfb']).optional(),
});
export const performanceMetricsQuerySchema = analyticsSchema({
  metric: z.enum(['lcp', 'inp', 'cls', 'fcp', 'ttfb']).optional(),
  type: z.enum(['path', 'title', 'device', 'browser']),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
export const utmMetricsQuerySchema = analyticsSchema({
  type: z.enum(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']),
});
