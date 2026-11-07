import { z } from 'zod';

export const errorStatusSchema = z.enum(['unresolved', 'resolved', 'ignored']);
export const errorUpdateSchema = z.object({
  status: errorStatusSchema.meta({ description: 'New status of the issue.' }),
});
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
  salt: z.string().max(100).optional(),
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
  status: errorStatusSchema
    .optional()
    .meta({ description: 'Filter by issue status: `unresolved`, `resolved`, or `ignored`.' }),
  search: z.string().max(200).optional(),
  release: z
    .string()
    .max(100)
    .optional()
    .meta({ description: 'Filter by release, as set with `data-release` or `captureException`.' }),
  environment: z.string().max(50).optional().meta({
    description: 'Filter by environment, as set with `data-environment` or `captureException`.',
  }),
  browser: z.string().max(50).optional(),
  urlPath: z
    .string()
    .max(500)
    .optional()
    .meta({ description: 'Filter by the page path on which the error occurred.' }),
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
    type: errorValueTypeSchema.meta({
      description:
        'Error field to return values for: `release`, `environment`, `browser`, or `urlPath`.',
    }),
    value: z
      .string()
      .max(500)
      .optional()
      .meta({ description: 'Search text used to filter the returned values.' }),
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
