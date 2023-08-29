import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventDataFields } from 'queries';
import * as yup from 'yup';

export interface EventDataFieldsRequestQuery {
  websiteId: string;
  startAt: string;
  endAt: string;
  field?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
    field: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<EventDataFieldsRequestQuery>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt, field } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getEventDataFields(websiteId, { startDate, endDate, field });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
