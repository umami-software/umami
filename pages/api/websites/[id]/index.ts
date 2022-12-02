import { Website } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
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

  const {
    user: { id: userId },
  } = req.auth;
  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(userId, websiteId))) {
      return unauthorized(res);
    }

    const website = await getWebsite({ id: websiteId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateWebsite(userId, websiteId))) {
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
    if (!(await canDeleteWebsite(userId, websiteId))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
