import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { searchParams, segmentParamSchema, segmentTypeParam } from '@/lib/schema';
import {
  canUpdateWebsite,
  canViewSharedWebsiteFilters,
  getShareParametersForWebsite,
} from '@/permissions';
import { createSegment, getWebsiteSegment, getWebsiteSegments } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type } = query;

  if (websiteId && !(await canViewSharedWebsiteFilters(auth, websiteId))) {
    return unauthorized();
  }

  const shareParams = await getShareParametersForWebsite(auth, websiteId);

  if (shareParams?.segment) {
    const lockedSegment =
      type === 'segment' ? await getWebsiteSegment(websiteId, shareParams.segment) : null;
    const data = lockedSegment && lockedSegment.type === type ? [lockedSegment] : [];

    return json({ data, count: data.length, page: 1, pageSize: 10 });
  }

  const filters = await getQueryFilters(query);

  const segments = await getWebsiteSegments(websiteId, type, filters);

  return json(segments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    name: z.string().min(1).max(200),
    parameters: segmentParamSchema,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type, name, parameters } = body;

  if (type === 'cohort' && parameters.sessionPropertyFilters?.length) {
    return badRequest({ message: 'Session property filters are only supported for segments.' });
  }

  if (
    type === 'cohort' &&
    (!parameters.action?.type || !parameters.action?.value || !parameters.dateRange)
  ) {
    return badRequest({ message: 'Cohorts require an action type, action value, and date range.' });
  }

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await createSegment({
    id: uuid(),
    websiteId,
    type,
    name,
    parameters,
  } as any);

  return json(result);
}
