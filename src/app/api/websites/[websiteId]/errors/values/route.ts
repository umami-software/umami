import { errorAccess } from '@/lib/errors/access';
import { errorValuesQuerySchema } from '@/lib/errors/schema';
import { json } from '@/lib/response';
import { getErrorValues } from '@/queries/sql/errors/query';

export async function GET(request: Request, context: { params: Promise<{ websiteId: string }> }) {
  const params = await context.params;
  const access = await errorAccess(request, params, errorValuesQuerySchema);
  if (access.response) return access.response;
  return json(await getErrorValues(access.scope, access.query));
}
