import { ROLES } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { json, notFound } from '@/lib/response';
import type { WhiteLabel } from '@/lib/types';
import { getShareByCode, getWebsite } from '@/queries/prisma';

async function getAccountId(website: { userId?: string; teamId?: string }): Promise<string | null> {
  if (website.userId) {
    return website.userId;
  }

  if (website.teamId) {
    const teamOwner = await prisma.client.teamUser.findFirst({
      where: {
        teamId: website.teamId,
        role: ROLES.teamOwner,
      },
      select: {
        userId: true,
      },
    });

    return teamOwner?.userId || null;
  }

  return null;
}

async function getWhiteLabel(accountId: string): Promise<WhiteLabel | null> {
  if (!redis.enabled) {
    return null;
  }

  const data = await redis.client.get(`white-label:${accountId}`);

  if (data) {
    return data as WhiteLabel;
  }

  return null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const share = await getShareByCode(slug);

  if (!share) {
    return notFound();
  }

  const website = await getWebsite(share.entityId);

  const data: Record<string, any> = {
    shareId: share.id,
    websiteId: share.entityId,
    parameters: share.parameters,
  };

  data.token = createToken(data, secret());

  const accountId = await getAccountId(website);

  if (accountId) {
    const whiteLabel = await getWhiteLabel(accountId);

    if (whiteLabel) {
      data.whiteLabel = whiteLabel;
    }
  }

  return json(data);
}
