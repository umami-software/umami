import { canDeleteTeamWebsite } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import * as yup from 'yup';
import { deleteWebsite } from 'queries/admin/website';

export interface TeamWebsitesRequestQuery {
  id: string;
  websiteId: string;
}

const schema = {
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
    websiteId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamWebsitesRequestQuery>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: teamId, websiteId } = req.query;

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeamWebsite(req.auth, teamId, websiteId))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
