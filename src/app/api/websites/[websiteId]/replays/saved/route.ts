import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getSavedReplays } from '@/queries/prisma/sessionReplay';
import { getReplayDistinctIds } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getSavedReplays(websiteId, query);
  const distinctIds = await getReplayDistinctIds(
    websiteId,
    data.data.map(({ visitId }) => visitId),
  );

  return json({
    ...data,
    data: data.data.map(row => ({ ...row, distinctIds: distinctIds[row.visitId] })),
  });
}
