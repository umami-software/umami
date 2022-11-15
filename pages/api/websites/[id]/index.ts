import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { deleteWebsite, getWebsite, updateWebsite } from 'queries';
import { TYPE_WEBSITE } from 'lib/constants';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { NextApiResponse } from 'next';
import { Website } from 'interface/api/models';

export interface WebsiteReqeustQuery {
  id: string;
}

export interface WebsiteReqeustBody {
  name: string;
  domain: string;
  shareId: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteReqeustQuery, WebsiteReqeustBody>,
  res: NextApiResponse<Website | any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId } = req.query;

  if (!(await allowQuery(req, TYPE_WEBSITE))) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const website = await getWebsite({ id: websiteId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const { name, domain, shareId } = req.body;

    try {
      await updateWebsite(websiteId, {
        name,
        domain,
        shareId,
      });
    } catch (e) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res);
  }

  if (req.method === 'DELETE') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
