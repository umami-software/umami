import { z } from 'zod';

const nullableUuidSchema = z.uuid().nullable();
const nullableDateTimeSchema = z.iso.datetime().nullable();

export const replayConfigSchema = z
  .looseObject({
    replayEnabled: z.boolean().optional(),
    heatmapEnabled: z.boolean().optional(),
    sampleRate: z.number().min(0).max(1).optional(),
    heatmapSampleRate: z.number().min(0).max(1).optional(),
    maskLevel: z.enum(['strict', 'moderate']).optional(),
    maxDuration: z.number().int().positive().optional(),
    blockSelector: z.string().optional(),
  })
  .meta({ id: 'ReplayConfig' });

const websiteUserSchema = z
  .object({
    id: z.uuid(),
    username: z.string(),
  })
  .meta({ id: 'WebsiteUser' });

export const websiteSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    domain: z.string().nullable(),
    resetAt: nullableDateTimeSchema,
    userId: nullableUuidSchema,
    teamId: nullableUuidSchema,
    createdBy: nullableUuidSchema,
    createdAt: nullableDateTimeSchema,
    updatedAt: nullableDateTimeSchema,
    deletedAt: nullableDateTimeSchema,
    recorderEnabled: z.boolean(),
    replayConfig: replayConfigSchema.nullable(),
    shareId: z.string().nullable(),
    user: websiteUserSchema.optional(),
  })
  .meta({ id: 'Website' });

export const websitePageSchema = z
  .object({
    data: z.array(websiteSchema),
    count: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().nonnegative(),
    orderBy: z.string().optional(),
    search: z.string().optional(),
  })
  .meta({ id: 'WebsitePage' });

export const websiteIdPathSchema = z.object({
  websiteId: z.uuid().meta({
    description: 'Website ID.',
    param: { description: 'Website ID.' },
  }),
});
