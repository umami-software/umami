import { NextApiRequestQueryBody } from 'lib/types';
import { canTransferWebsiteToTeam, canTransferWebsiteToUser } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { updateWebsite } from 'queries';
import * as yup from 'yup';

export interface WebsiteTransferRequestQuery {
  websiteId: string;
}

export interface WebsiteTransferRequestBody {
  userId?: string;
  teamId?: string;
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    userId: yup.string().uuid(),
    teamId: yup.string().uuid(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteTransferRequestQuery, WebsiteTransferRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId } = req.query;
  const { userId, teamId } = req.body;

  if (req.method === 'POST') {
    if (userId) {
      if (!(await canTransferWebsiteToUser(req.auth, websiteId, userId))) {
        return unauthorized(res);
      }

      const website = await updateWebsite(websiteId, {
        userId,
        teamId: null,
      });

      return ok(res, website);
    } else if (teamId) {
      if (!(await canTransferWebsiteToTeam(req.auth, websiteId, teamId))) {
        return unauthorized(res);
      }

      const website = await updateWebsite(websiteId, {
        userId: null,
        teamId,
      });

      return ok(res, website);
    }

    return badRequest(res);
  }

  return methodNotAllowed(res);
};
