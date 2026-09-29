import { z } from 'zod';

export const errorStatusSchema = z.enum(['unresolved', 'resolved', 'ignored']);
export const errorSettingsSchema = z.object({
  enabled: z.boolean(),
  retentionDays: z.number().int().min(1).max(90),
});
export const errorUpdateSchema = z.object({ status: errorStatusSchema });
export const errorPayloadSchema = z.object({
  version: z.literal(1),
  website: z.uuid(),
  eventId: z.uuid(),
  timestamp: z.number().int().positive(),
  name: z.string().min(1).max(200),
  message: z.string().max(2000),
  stack: z.string().max(16000).default(''),
  handled: z.boolean().default(false),
  url: z.string().max(2000),
  release: z.string().max(100).default(''),
  environment: z.string().max(50).default('production'),
  tags: z
    .record(z.string().max(50), z.string().max(200))
    .refine(v => Object.keys(v).length <= 20)
    .default({}),
  fingerprint: z.array(z.string().min(1).max(200)).min(1).max(5).optional(),
  id: z.string().max(50).optional(),
  language: z.string().max(35).optional(),
  screen: z.string().max(11).optional(),
});
export const errorCollectionSchema = z.object({
  type: z.literal('error'),
  payload: errorPayloadSchema,
});
const errorFilterFields = {
  startAt: z.coerce.number().int().min(0).max(4102444800000),
  endAt: z.coerce.number().int().min(0).max(4102444800000),
  status: errorStatusSchema.optional(),
  search: z.string().max(200).optional(),
  release: z.string().max(100).optional(),
  environment: z.string().max(50).optional(),
  browser: z.string().max(50).optional(),
  urlPath: z.string().max(500).optional(),
};
const dateRangeRefinement = [
  (v: { startAt: number; endAt: number }) => v.endAt >= v.startAt,
  { message: 'The end of the date range must follow its start.' },
] as const;
export const errorQuerySchema = z
  .object({
    ...errorFilterFields,
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine(...dateRangeRefinement);
export const errorValueTypeSchema = z.enum(['release', 'environment', 'browser', 'urlPath']);
export const errorValuesQuerySchema = z
  .object({
    ...errorFilterFields,
    type: errorValueTypeSchema,
    value: z.string().max(500).optional(),
  })
  .refine(...dateRangeRefinement);
export type ErrorPayload = z.infer<typeof errorPayloadSchema>;
export type ErrorQuery = z.infer<typeof errorQuerySchema>;
export type ErrorValuesQuery = z.infer<typeof errorValuesQuerySchema>;
export type ErrorValueType = z.infer<typeof errorValueTypeSchema>;
export type ErrorStatus = z.infer<typeof errorStatusSchema>;

export interface ErrorFrame {
  filename: string;
  function: string;
  line: number;
  column: number;
}
