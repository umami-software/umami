import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceOrder } from '@/queries/sql/commerce/getCommerceOrder';

const commerceOrderParamsSchema = z.object({
  websiteId: z.uuid(),
  commerceEventId: z.uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; commerceEventId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const result = commerceOrderParamsSchema.safeParse(await params);
  if (!result.success) return badRequest(z.treeifyError(result.error));
  const { websiteId, commerceEventId } = result.data;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();

  const order = await getCommerceOrder(websiteId, commerceEventId);

  if (!order) return notFound();

  return json(order);
}
