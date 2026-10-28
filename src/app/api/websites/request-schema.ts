import { z } from 'zod';
import { DOMAIN_REGEX } from '@/lib/constants';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';

export const replayConfigInputSchema = z
  .object({
    replayEnabled: z.boolean().optional(),
    heatmapEnabled: z.boolean().optional(),
    sampleRate: z.number().min(0).max(1).optional(),
    heatmapSampleRate: z.number().min(0).max(1).optional(),
    maskLevel: z.enum(['strict', 'moderate']).optional(),
    maxDuration: z.number().int().positive().optional(),
    blockSelector: z.string().optional(),
  })
  .meta({ id: 'ReplayConfigInput' });

export const listWebsitesQuerySchema = z
  .object({
    ...pagingParams,
    ...searchParams,
    ...sortingParams,
    includeTeams: z.string().optional().meta({
      description: 'When present, include websites accessible through team membership.',
    }),
  })
  .meta({ id: 'ListWebsitesQuery' });

export const createWebsiteRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    domain: z.string().trim().regex(DOMAIN_REGEX).max(500),
    shareId: z.string().max(50).nullable().optional(),
    teamId: z.uuid().nullable().optional(),
    id: z.uuid().nullable().optional(),
  })
  .meta({ id: 'CreateWebsiteRequest' });

export const updateWebsiteRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    domain: z.string().trim().regex(DOMAIN_REGEX).max(500).optional(),
    shareId: z.string().max(50).nullable().optional(),
    replayConfig: replayConfigInputSchema.nullable().optional(),
  })
  .meta({ id: 'UpdateWebsiteRequest' });

// Largest timestamp a JavaScript Date can hold, in milliseconds.
const MAX_TIMESTAMP = 8.64e15;

// Numbers from JSON bodies, or digit-only strings from query parameters. Unlike z.coerce,
// it rejects null, '' and false instead of turning them into 0.
const timestampSchema = z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]);

export const websiteDataRangeSchema = z
  .object({
    startAt: timestampSchema.pipe(z.number().int().nonnegative().max(MAX_TIMESTAMP)),
    endAt: timestampSchema.pipe(z.number().int().positive().max(MAX_TIMESTAMP)),
  })
  .refine(({ startAt, endAt }) => startAt < endAt, {
    message: 'startAt must be before endAt',
    path: ['endAt'],
  })
  .meta({ id: 'WebsiteDataRange' });
