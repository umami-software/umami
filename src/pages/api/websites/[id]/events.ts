import { WebsiteMetric, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import moment from 'moment-timezone';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventMetrics } from 'queries';
import { parseDateRangeQuery } from 'lib/query';

const unitTypes = ['year', 'month', 'hour', 'day'];

export interface WebsiteEventsRequestQuery {
  id: string;
  startAt: string;
  endAt: string;
  unit: string;
  timezone: string;
  url: string;
}

import * as yup from 'yup';

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
    unit: yup.string().required(),
    timezone: yup.string().required(),
    url: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteEventsRequestQuery>,
  res: NextApiResponse<WebsiteMetric>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { id: websiteId, timezone, url } = req.query;
  const { startDate, endDate, unit } = await parseDateRangeQuery(req);

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    if (!moment.tz.zone(timezone) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const events = await getEventMetrics(websiteId, {
      startDate,
      endDate,
      timezone,
      unit,
      url,
    });

    return ok(res, events);
  }

  return methodNotAllowed(res);
};
