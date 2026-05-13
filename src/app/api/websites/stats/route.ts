import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getMultipleWebsiteStats } from '@/queries/sql';

const MAX_IDS = 100;

export async function GET(request: Request) {
  const schema = z.object({
    ids: z.string().min(1),
    startAt: z.coerce.number(),
    endAt: z.coerce.number(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { ids, startAt, endAt } = query;
  const websiteIds = ids.split(',').slice(0, MAX_IDS);

  const authorized = await Promise.all(
    websiteIds.map(id => canViewWebsite(auth, id).then(ok => (ok ? id : null))),
  );
  const authorizedIds = authorized.filter(Boolean) as string[];

  if (authorizedIds.length === 0) {
    return unauthorized();
  }

  const stats = await getMultipleWebsiteStats(authorizedIds, new Date(startAt), new Date(endAt));

  return json(stats);
}
