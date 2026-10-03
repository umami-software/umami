import { z } from 'zod';
import { DOMAIN_REGEX } from '@/lib/constants';
import {
  RECORDER_CANVAS_FPS_MAX,
  RECORDER_CANVAS_FPS_MIN,
  RECORDER_CONSOLE_LEVELS,
  RECORDER_MASK_LEVELS,
} from '@/lib/recorder';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';

export const replayConfigInputSchema = z
  .object({
    replayEnabled: z.boolean().optional(),
    heatmapEnabled: z.boolean().optional(),
    sampleRate: z.number().min(0).max(1).optional(),
    heatmapSampleRate: z.number().min(0).max(1).optional(),
    maskLevel: z.enum(RECORDER_MASK_LEVELS).optional(),
    consoleLevel: z.enum(RECORDER_CONSOLE_LEVELS).optional(),
    maxDuration: z.number().int().positive().optional(),
    blockSelector: z.string().optional(),
    recordCanvas: z.boolean().optional(),
    canvasFps: z
      .number()
      .int()
      .min(RECORDER_CANVAS_FPS_MIN)
      .max(RECORDER_CANVAS_FPS_MAX)
      .optional(),
    canvasQuality: z.number().min(0).max(1).optional(),
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
