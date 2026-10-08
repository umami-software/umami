import { CommerceIdentityError, getCommerceEventId, recordCommerceSchema } from '@/lib/commerce';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { getWebsite } from '@/queries/prisma';
import { saveCommerceEvent } from '@/queries/sql/commerce/saveCommerceEvent';

/** Server integrations record orders/refunds without manufacturing website traffic. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, recordCommerceSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();
  const website = await getWebsite(websiteId);
  if (!website || website.deletedAt) return notFound();
  const { occurredAt, ...data } = body;
  const id = getCommerceEventId(websiteId, data);
  try {
    await saveCommerceEvent({
      eventId: id,
      websiteId,
      eventName: data.type,
      createdAt: occurredAt ? new Date(occurredAt) : new Date(),
      data,
    });
  } catch (error) {
    if (error instanceof CommerceIdentityError) return badRequest({ message: error.message });
    throw error;
  }
  return json({ id });
}
