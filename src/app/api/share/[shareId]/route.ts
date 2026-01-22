import { ROLES } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { json, notFound } from '@/lib/response';
import { getSharedWebsite } from '@/queries/prisma';

export interface WhiteLabel {
  name: string;
  url: string;
  image: string;
}

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

export async function GET(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const website = await getSharedWebsite(shareId);

  if (!website) {
    return notFound();
  }

  const data: { websiteId: string; token: string; whiteLabel?: WhiteLabel } = {
    websiteId: website.id,
    token: createToken({ websiteId: website.id }, secret()),
  };

  const accountId = await getAccountId(website);

  if (accountId) {
    const whiteLabel = await getWhiteLabel(accountId);

    if (whiteLabel) {
      data.whiteLabel = whiteLabel;
    }
  }

  return json(data);
}
