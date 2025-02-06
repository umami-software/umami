import { z } from 'zod';
import { json, unauthorized } from '@/lib/response';
import { getAllUserWebsitesIncludingTeamOwner } from '@/queries/prisma/website';
import { getEventUsage } from '@/queries/sql/events/getEventUsage';
import { getEventDataUsage } from '@/queries/sql/events/getEventDataUsage';
import { parseRequest } from '@/lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth.user.isAdmin) {
    return unauthorized();
  }

  const { userId } = await params;
  const { startAt, endAt } = query;

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  const websites = await getAllUserWebsitesIncludingTeamOwner(userId);

  const websiteIds = websites.map(a => a.id);

  const websiteEventUsage = await getEventUsage(websiteIds, startDate, endDate);
  const eventDataUsage = await getEventDataUsage(websiteIds, startDate, endDate);

  const websiteUsage = websites.map(a => ({
    websiteId: a.id,
    websiteName: a.name,
    websiteEventUsage: websiteEventUsage.find(b => a.id === b.websiteId)?.count || 0,
    eventDataUsage: eventDataUsage.find(b => a.id === b.websiteId)?.count || 0,
    deletedAt: a.deletedAt,
  }));

  const usage = websiteUsage.reduce(
    (acc, cv) => {
      acc.websiteEventUsage += cv.websiteEventUsage;
      acc.eventDataUsage += cv.eventDataUsage;

      return acc;
    },
    { websiteEventUsage: 0, eventDataUsage: 0 },
  );

  const filteredWebsiteUsage = websiteUsage.filter(
    a => !a.deletedAt && (a.websiteEventUsage > 0 || a.eventDataUsage > 0),
  );

  return json({
    ...usage,
    websites: filteredWebsiteUsage,
  });
}
