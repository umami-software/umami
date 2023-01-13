import { Website, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite, canUpdateWebsite, canDeleteWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { deleteWebsite, getWebsite, updateWebsite } from 'queries';

export interface WebsiteRequestQuery {
  id: string;
}

export interface WebsiteRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteRequestQuery, WebsiteRequestBody>,
  res: NextApiResponse<Website>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { user, shareToken } = req.auth;
  const userId = user?.id;
  const websiteId = req.query.id;
  const shared = shareToken?.websiteId === websiteId;

  if (req.method === 'GET') {
    const canView = await canViewWebsite(userId, websiteId);

    if (!canView && !shared) {
      return unauthorized(res);
    }

    const website = await getWebsite({ id: websiteId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const canUpdate = await canUpdateWebsite(userId, websiteId);

    if (!canUpdate) {
      return unauthorized(res);
    }

    const { name, domain, shareId } = req.body;

    try {
      await updateWebsite(websiteId, { name, domain, shareId });
    } catch (e: any) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res);
  }

  if (req.method === 'DELETE') {
    const canDelete = await canDeleteWebsite(userId, websiteId);

    if (!canDelete) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
