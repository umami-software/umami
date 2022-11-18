import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { uuid } from 'lib/crypto';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { getRandomChars, methodNotAllowed, ok } from 'next-basics';
import { createWebsiteByUser, getAllWebsites, getWebsitesByUserId } from 'queries';

export interface WebsitesReqeustQuery {
  include_all?: boolean;
}

export interface WebsitesReqeustBody {
  name: string;
  domain: string;
  enableShareUrl: boolean;
}

export default async (
  req: NextApiRequestQueryBody<WebsitesReqeustQuery, WebsitesReqeustBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId, isAdmin },
  } = req.auth;

  if (req.method === 'GET') {
    const { include_all } = req.query;

    const websites =
      isAdmin && include_all ? await getAllWebsites() : await getWebsitesByUserId(userId);

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain, enableShareUrl } = req.body;

    const shareId = enableShareUrl ? getRandomChars(8) : null;
    const website = await createWebsiteByUser(userId, { id: uuid(), name, domain, shareId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
