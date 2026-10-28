import { randomBytes } from 'node:crypto';
import { uuid } from '@/lib/crypto';
import { widgetInputSchema } from '@/lib/marketing-widgets';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { createWidget, getWebsiteWidgets } from '@/queries/prisma';

export function prepareDelivery(delivery: any) {
  if (delivery.webhook?.enabled && !delivery.webhook.secret) {
    delivery.webhook.secret = randomBytes(24).toString('hex');
  }
  return delivery;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  // Includes delivery settings (webhook secret): managers only, never share tokens.
  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  return json(await getWebsiteWidgets(websiteId));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, widgetInputSchema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const widget = await createWidget({
    id: uuid(),
    websiteId,
    type: body.type,
    name: body.name,
    enabled: body.enabled,
    config: body.config,
    delivery: prepareDelivery(body.delivery),
  });

  return json(widget);
}
