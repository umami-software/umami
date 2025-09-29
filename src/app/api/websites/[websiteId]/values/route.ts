import { canViewWebsite } from '@/permissions';
import { EVENT_COLUMNS, FILTER_COLUMNS, SEGMENT_TYPES, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { getValues } from '@/queries/sql';
import { getWebsiteSegments } from '@/queries/prisma';
import { z } from 'zod';
import { dateRangeParams, fieldsParam, searchParams } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: fieldsParam,
    ...dateRangeParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { type } = query;

  if (!SESSION_COLUMNS.includes(type) && !EVENT_COLUMNS.includes(type) && !SEGMENT_TYPES[type]) {
    return badRequest();
  }

  let values: any[];

  if (SEGMENT_TYPES[type]) {
    values = (await getWebsiteSegments(websiteId, type))?.data?.map(segment => ({
      value: segment.name,
    }));
  } else {
    const filters = await getQueryFilters(query, websiteId);
    values = await getValues(websiteId, FILTER_COLUMNS[type], filters);
  }

  return json(values.filter(n => n).sort());
}
