import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest, setWebsiteDate } from '@/lib/request';
import { json } from '@/lib/response';
import { timezoneParam, unitParam } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { canViewBatchWebsites } from '@/permissions/website';
import {
  getEventStats,
  getPageviewStats,
  getSessionStats,
  getWebsiteDateRange,
  getWebsiteStats,
} from '@/queries/sql';

// Cross-website comparison: the same date-bucketed series the single-website
// overview and events pages already use, for several websites in one call.
// Consumers (the /overview page) stack them by website. Only websites the
// caller may view come back; unknown or forbidden ids are silently dropped,
// mirroring /api/websites/charts. A share token is held to the sections it
// shares, as on the single-website routes: views and visitors need the
// overview section, event counts the events section.
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

  const access = await Promise.all(
    websiteIds.map(async id => ({
      id,
      overview: await canViewWebsiteSection(auth, id, ['overview', 'compare']),
      events: await canViewWebsiteSection(auth, id, 'events'),
    })),
  );
  const allowed = new Map(access.filter(item => item.overview).map(item => [item.id, item.events]));

  if (!allowed.size) {
    return json({ data: [] });
  }

  const websites = await prisma.client.website.findMany({
    where: { id: { in: Array.from(allowed.keys()) }, deletedAt: null },
    select: { id: true, name: true, domain: true },
    orderBy: { name: 'asc' },
  });

  const data = await Promise.all(
    websites.map(async website => {
      // Built per website: setWebsiteDate clamps the start date to what that
      // website's account may query, so the websites cannot share one object.
      const filters = await setWebsiteDate(website.id, {
        startDate: new Date(query.startAt),
        endDate: new Date(query.endAt),
        unit: query.unit || 'day',
        timezone: query.timezone || 'UTC',
      });

      const [pageviews, sessions, events, stats, range] = await Promise.all([
        getPageviewStats(website.id, filters),
        getSessionStats(website.id, filters),
        allowed.get(website.id) ? getEventStats(website.id, {}, filters) : [],
        getWebsiteStats(website.id, filters),
        getWebsiteDateRange(website.id),
      ]);

      // `sessions` counts distinct visitors per time bucket, so summing it
      // counts a visitor once per bucket they appear in. The table total comes
      // from the whole period instead, matching a single website's stats.
      return {
        ...website,
        pageviews,
        sessions,
        events,
        visitors: Number(stats?.visitors ?? 0),
        range,
      };
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
