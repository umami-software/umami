import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { Website, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite, canUpdateWebsite, canDeleteWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { deleteWebsite, getWebsiteById, updateWebsite } from 'queries';
import { SHARE_ID_REGEX } from 'lib/constants';

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

  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const website = await getWebsiteById(websiteId);

    return ok(res, website);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { name, domain, shareId } = req.body;

    let website;

    if (shareId && !shareId.match(SHARE_ID_REGEX)) {
      return serverError(res, 'Invalid share ID.');
    }

    try {
      website = await updateWebsite(websiteId, { name, domain, shareId });
    } catch (e: any) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res, website);
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
