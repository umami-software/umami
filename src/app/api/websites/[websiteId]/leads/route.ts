import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { getWebsiteLeads } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(50),
  });
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  // Leads are private: signed-in managers only (public share tokens must not pass).
  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  return json(await getWebsiteLeads(websiteId, query.page, query.pageSize));
}
