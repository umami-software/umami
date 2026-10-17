import { errorAccess } from '@/lib/errors/access';
import { errorQuerySchema } from '@/lib/errors/schema';
import { json } from '@/lib/response';
import { getErrorIssues } from '@/queries/sql/errors/query';

export async function GET(request: Request, context: { params: Promise<{ websiteId: string }> }) {
  const params = await context.params;
  const access = await errorAccess(request, params, errorQuerySchema);
  if (access.response) return access.response;
  return json(await getErrorIssues(access.scope, access.query));
}
