import { CommerceIdentityError, getCommerceEventId } from '@/lib/commerce';
import { normalizeShopifyCommerce, shopifyCommerceSchema } from '@/lib/commerce/shopify';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { getWebsite } from '@/queries/prisma';
import { saveCommerceEvent } from '@/queries/sql/commerce/saveCommerceEvent';

/** An authenticated import, not an unauthenticated Shopify webhook receiver. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, shopifyCommerceSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();
  const website = await getWebsite(websiteId);
  if (!website || website.deletedAt) return notFound();
  let records: ReturnType<typeof normalizeShopifyCommerce>;
  try {
    records = normalizeShopifyCommerce(body);
  } catch {
    return badRequest({ message: 'Invalid Shopify order or refund amounts/timestamps.' });
  }
  const ids: string[] = [];
  // Validate every record before writing. A partially delivered batch can safely be retried.
  try {
    for (const { occurredAt, ...data } of records) {
      const id = getCommerceEventId(websiteId, data);
      await saveCommerceEvent({
        eventId: id,
        websiteId,
        eventName: data.type,
        createdAt: new Date(occurredAt),
        data,
      });
      ids.push(id);
    }
  } catch (error) {
    if (error instanceof CommerceIdentityError) return badRequest({ message: error.message });
    throw error;
  }
  return json({ ids });
}
