import { definitionListSchema } from '@/lib/analytics-schema';
import { commerceReportDefinitionSchema } from '@/lib/commerce-saved-reports';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsiteSection } from '@/permissions';
import { createReport, getReports } from '@/queries/prisma';

type Context = { params: Promise<{ websiteId: string }> };
export async function GET(request: Request, { params }: Context) {
  const { auth, query, error } = await parseRequest(request, definitionListSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  return json(
    await getReports(
      { where: { websiteId, type: 'commerce', website: { deletedAt: null } } },
      query,
    ),
  );
}
export async function POST(request: Request, { params }: Context) {
  const { auth, body, error } = await parseRequest(request, commerceReportDefinitionSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();
  return json(
    await createReport({ ...body, id: uuid(), userId: auth.user.id, websiteId, type: 'commerce' }),
  );
}
