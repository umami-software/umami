import { definitionListSchema, funnelDefinitionSchema } from '@/lib/analytics-schema';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsiteSection } from '@/permissions';
import { createReport, getReports } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, definitionListSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'funnels'))) return unauthorized();
  return json(
    await getReports({ where: { websiteId, type: 'funnel', website: { deletedAt: null } } }, query),
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, funnelDefinitionSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();
  return json(
    await createReport({
      id: uuid(),
      userId: auth.user.id,
      websiteId,
      type: 'funnel',
      name: body.name,
      description: body.description || '',
      parameters: body.parameters,
    }),
  );
}
