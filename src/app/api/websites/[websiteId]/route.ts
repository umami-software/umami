import { z } from 'zod';
import type { Prisma } from '@/generated/prisma/client';
import { ENTITY_TYPE } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { getRecorderConfig, getRecorderEnabled } from '@/lib/recorder';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, serverError, unauthorized } from '@/lib/response';
import { canDeleteWebsite, canUpdateWebsite, canViewSharedWebsite } from '@/permissions';
import {
  createShare,
  deleteSharesByEntityId,
  deleteWebsite,
  getShareByEntityId,
  getWebsite,
  updateWebsite,
} from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewSharedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const website = await getWebsite(websiteId);

  return json(website);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    domain: z.string().max(500).optional(),
    shareId: z.string().max(50).nullable().optional(),
    replayConfig: z
      .object({
        replayEnabled: z.boolean().optional(),
        heatmapEnabled: z.boolean().optional(),
        sampleRate: z.number().min(0).max(1).optional(),
        heatmapSampleRate: z.number().min(0).max(1).optional(),
        maskLevel: z.enum(['strict', 'moderate']).optional(),
        maxDuration: z.number().int().positive().optional(),
        blockSelector: z.string().optional(),
      })
      .nullable()
      .optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { name, domain, shareId, replayConfig } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const currentWebsite = await getWebsite(websiteId);

    if (!currentWebsite) {
      return badRequest({ message: 'Website not found.' });
    }

    const nextReplayConfig = getRecorderConfig(
      replayConfig === null
        ? {}
        : {
            ...getRecorderConfig(currentWebsite.replayConfig),
            ...(replayConfig ?? {}),
          },
    );

    const website = await updateWebsite(websiteId, {
      name,
      domain,
      ...(replayConfig !== undefined && {
        replayConfig: nextReplayConfig as Prisma.InputJsonObject,
        recorderEnabled: getRecorderEnabled(nextReplayConfig),
      }),
    });

    if (shareId === null) {
      await deleteSharesByEntityId(website.id);
    }

    const share = shareId
      ? await createShare({
          id: uuid(),
          entityId: websiteId,
          shareType: ENTITY_TYPE.website,
          name: website.name,
          slug: shareId,
          parameters: { overview: true, events: true },
        })
      : await getShareByEntityId(websiteId);

    return json({
      ...website,
      shareId: share?.slug ?? null,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint')) {
      return badRequest({ message: 'That share ID is already taken.' });
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await deleteWebsite(websiteId);

  return ok();
}
