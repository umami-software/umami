import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { annotationSchema, pagingParams, searchParams } from '@/lib/schema';
import { canUpdateWebsite, canViewSharedWebsiteFilters } from '@/permissions';
import { createAnnotation, getWebsiteAnnotations } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().optional(),
    endAt: z.coerce.number().optional(),
    ...searchParams,
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { startAt, endAt, search, page, pageSize } = query;

  if (!(await canViewSharedWebsiteFilters(auth, websiteId))) {
    return unauthorized();
  }

  const annotations = await getWebsiteAnnotations(websiteId, {
    search,
    page,
    pageSize,
    ...(startAt && endAt && { startDate: new Date(startAt), endDate: new Date(endAt) }),
  });

  return json(annotations);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, annotationSchema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { date, allDay, note } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await createAnnotation({
    id: uuid(),
    websiteId,
    userId: auth.user.id,
    date,
    allDay,
    note,
  });

  return json(result);
}
