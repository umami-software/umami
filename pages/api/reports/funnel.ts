import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getPageviewFunnel } from 'queries';

export interface FunnelRequestBody {
  websiteId: string;
  urls: string[];
  window: number;
  startAt: number;
  endAt: number;
}

export interface FunnelResponse {
  urls: string[];
  window: number;
  startAt: number;
  endAt: number;
}

export default async (
  req: NextApiRequestQueryBody<any, FunnelRequestBody>,
  res: NextApiResponse<FunnelResponse>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'POST') {
    const { websiteId, urls, window, startAt, endAt } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getPageviewFunnel(websiteId, {
      startDate,
      endDate,
      urls,
      windowMinutes: +window,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
