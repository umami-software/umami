import { parseRequest } from '@/lib/request';
import { notFound, ok, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { deleteLead, getLead } from '@/queries/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { leadId } = await params;
  const lead = await getLead(leadId);

  if (!lead) {
    return notFound();
  }

  if (!(await canUpdateWebsite(auth, lead.websiteId))) {
    return unauthorized();
  }

  await deleteLead(leadId);
  return ok();
}
