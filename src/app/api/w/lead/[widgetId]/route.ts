import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { deliverLead } from '@/lib/lead-delivery';
import {
  originMatchesDomain,
  parseLead,
  type WidgetDelivery,
  type WidgetType,
  widgetDeliverySchema,
} from '@/lib/marketing-widgets';
import { rateLimit } from '@/lib/rate-limit';
import { badRequest, forbidden, json, notFound } from '@/lib/response';
import { createLead, getWebsite, getWidget, setLeadDelivery } from '@/queries/prisma';

function clientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Public lead intake. Body is JSON sent as text/plain to avoid a CORS preflight. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { widgetId } = await params;

  if (!z.uuid().safeParse(widgetId).success) {
    return notFound();
  }

  if (!rateLimit(`lead:${clientIp(request)}:${widgetId}`, 5, 60_000)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const raw = await request.text();

  if (raw.length > 4000) {
    return badRequest({ message: 'Payload too large' });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest({ message: 'Invalid JSON' });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (body?.hp) {
    return json({ ok: true });
  }

  const widget = await getWidget(widgetId);

  if (!widget?.enabled) {
    return notFound();
  }

  const website = await getWebsite(widget.websiteId);

  // The request must come from the website the widget belongs to.
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (!website || !originMatchesDomain(origin, website.domain)) {
    return forbidden({ message: 'Origin not allowed' });
  }

  const data = parseLead(widget.type as WidgetType, body);

  if (!data) {
    return badRequest({ message: 'Invalid data' });
  }

  const delivery = widgetDeliverySchema.parse(widget.delivery) as WidgetDelivery;
  const pageUrl = typeof body.page === 'string' ? body.page.slice(0, 500) : undefined;
  const id = uuid();

  if (delivery.store) {
    await createLead({ id, widgetId, websiteId: widget.websiteId, data, pageUrl });
  }

  const status = await deliverLead(delivery, {
    leadId: id,
    widgetName: widget.name,
    widgetType: widget.type,
    website: website.domain || website.name,
    pageUrl,
    data: data as Record<string, string>,
    createdAt: new Date().toISOString(),
  });

  if (delivery.store && Object.keys(status).length) {
    await setLeadDelivery(id, status);
  }

  return json({ ok: true });
}
