import { Prisma } from '@prisma/client';
import { NextApiRequestQueryBody } from 'lib/types';
import { uuid } from 'lib/crypto';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createWebsite, getUserWebsites } from 'queries';

export interface WebsitesRequestQuery {}

export interface WebsitesRequestBody {
  name: string;
  domain: string;
  shareId: string;
  teamId?: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsitesRequestQuery, WebsitesRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const websites = await getUserWebsites(userId);

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain, shareId, teamId } = req.body;

    const data: Prisma.WebsiteUncheckedCreateInput = {
      id: uuid(),
      name,
      domain,
      shareId,
    };

    if (teamId) {
      data.teamId = teamId;
    } else {
      data.userId = userId;
    }

    const website = await createWebsite(data);

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
