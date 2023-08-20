import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventDataUsage, getEventUsage, getUserWebsites } from 'queries';
import * as yup from 'yup';

export interface UserUsageRequestQuery {
  id: string;
  startAt: string;
  endAt: string;
}

export interface UserUsageRequestResponse {
  websiteEventUsage: number;
  eventDataUsage: number;
  websites: {
    websiteEventUsage: number;
    eventDataUsage: number;
    websiteId: string;
    websiteName: string;
  }[];
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<UserUsageRequestQuery>,
  res: NextApiResponse<UserUsageRequestResponse>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { user } = req.auth;

  if (req.method === 'GET') {
    if (!user.isAdmin) {
      return unauthorized(res);
    }

    const { id: userId, startAt, endAt } = req.query;

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const websites = await getUserWebsites(userId);

    const websiteIds = websites.map(a => a.id);

    const websiteEventUsage = await getEventUsage(websiteIds, startDate, endDate);
    const eventDataUsage = await getEventDataUsage(websiteIds, startDate, endDate);

    const websiteUsage = websites.map(a => ({
      websiteId: a.id,
      websiteName: a.name,
      websiteEventUsage: websiteEventUsage.find(b => a.id === b.websiteId)?.count || 0,
      eventDataUsage: eventDataUsage.find(b => a.id === b.websiteId)?.count || 0,
    }));

    const usage = websiteUsage.reduce(
      (acc, cv) => {
        acc.websiteEventUsage += cv.websiteEventUsage;
        acc.eventDataUsage += cv.eventDataUsage;

        return acc;
      },
      { websiteEventUsage: 0, eventDataUsage: 0 },
    );

    return ok(res, {
      ...usage,
      websites: websiteUsage,
    });
  }

  return methodNotAllowed(res);
};
