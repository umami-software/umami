import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { timezoneParam, unitParam } from '@/lib/schema';
import { canViewBatchWebsites } from '@/permissions/website';
import {
  getEventStats,
  getPageviewStats,
  getSessionStats,
  getWebsiteDateRange,
} from '@/queries/sql';

// Cross-website comparison: the same date-bucketed series the single-website
// overview and events pages already use, for several websites in one call.
// Consumers (the /overview page) stack them by website. Only websites the
// caller may view come back; unknown or forbidden ids are silently dropped,
// mirroring /api/websites/charts.
const schema = z.object({
  ids: z
    .string()
    .transform(value =>
      value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.uuid()).min(1).max(20)),
  startAt: z.coerce.number().int(),
  endAt: z.coerce.number().int(),
  unit: unitParam.optional(),
  timezone: timezoneParam.optional(),
});

export async function GET(request: Request) {
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const websiteIds = await canViewBatchWebsites(auth, query.ids);

  if (!websiteIds.length) {
    return json({ data: [] });
  }

  const filters = {
    startDate: new Date(query.startAt),
    endDate: new Date(query.endAt),
    unit: query.unit || 'day',
    timezone: query.timezone || 'UTC',
  };

  const websites = await prisma.client.website.findMany({
    where: { id: { in: websiteIds }, deletedAt: null },
    select: { id: true, name: true, domain: true },
    orderBy: { name: 'asc' },
  });

  const data = await Promise.all(
    websites.map(async website => {
      const [pageviews, sessions, events, range] = await Promise.all([
        getPageviewStats(website.id, filters),
        getSessionStats(website.id, filters),
        getEventStats(website.id, {}, filters),
        getWebsiteDateRange(website.id),
      ]);

      return { ...website, pageviews, sessions, events, range };
    }),
  );

  // Earliest/latest data across the selected websites, so the page can offer
  // an "all time" range the same way a single website's date filter does.
  const starts = data.map(website => website.range?.startDate).filter(Boolean);
  const ends = data.map(website => website.range?.endDate).filter(Boolean);
  const startDate = starts.length ? new Date(Math.min(...starts.map(d => +new Date(d)))) : null;
  const endDate = ends.length ? new Date(Math.max(...ends.map(d => +new Date(d)))) : null;

  return json({
    data: data.map(({ range: _range, ...website }) => website),
    startDate,
    endDate,
  });
}
