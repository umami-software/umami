import { Website } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { allowQuery } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized, badRequest } from 'next-basics';
import { deleteWebsite, getWebsite, updateWebsite } from 'queries';

export interface WebsiteRequestQuery {
  id: string;
}

export interface WebsiteRequestBody {
  name: string;
  domain: string;
  shareId: string;
  userId?: string;
  teamId?: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteRequestQuery, WebsiteRequestBody>,
  res: NextApiResponse<Website | any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId } = req.query;

  if (!(await allowQuery(req, UmamiApi.AuthType.Website))) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const website = await getWebsite({ id: websiteId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const { ...data } = req.body;

    if (!data.userId && !data.teamId) {
      badRequest(res, 'A website must be assigned to a User or Team.');
    }

    try {
      await updateWebsite(websiteId, data);
    } catch (e: any) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res);
  }

  if (req.method === 'DELETE') {
    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
