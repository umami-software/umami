import { isRelationalOnly } from '@/lib/db';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { canDeleteWebsite } from '@/permissions';
import { clearWebsiteData, getWebsiteDataCounts } from '@/queries/prisma';
import { websiteDataRangeSchema } from '../../request-schema';

const RELATIONAL_ONLY_MESSAGE =
  'Deleting data for a date range is only available with relational storage.';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, websiteDataRangeSchema);

  if (error) {
    return error();
  }

  if (!isRelationalOnly()) {
    return badRequest({ message: RELATIONAL_ONLY_MESSAGE });
  }

  const { websiteId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const counts = await getWebsiteDataCounts(
    websiteId,
    new Date(query.startAt),
    new Date(query.endAt),
  );

  return json({ ...counts });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, websiteDataRangeSchema);

  if (error) {
    return error();
  }

  if (!isRelationalOnly()) {
    return badRequest({ message: RELATIONAL_ONLY_MESSAGE });
  }

  const { websiteId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const counts = await clearWebsiteData(websiteId, new Date(body.startAt), new Date(body.endAt));

  return json({ ...counts });
}
