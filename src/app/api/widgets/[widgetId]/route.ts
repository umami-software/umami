import { randomBytes } from 'node:crypto';
import { widgetInputSchema } from '@/lib/marketing-widgets';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { deleteWidget, getWidget, updateWidget } from '@/queries/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ widgetId: string }> }) {
  const { auth, body, error } = await parseRequest(request, widgetInputSchema);

  if (error) {
    return error();
  }

  const { widgetId } = await params;
  const widget = await getWidget(widgetId);

  if (!widget) {
    return notFound();
  }

  if (!(await canUpdateWebsite(auth, widget.websiteId))) {
    return unauthorized();
  }

  const delivery: any = body.delivery;
  if (delivery.webhook?.enabled && !delivery.webhook.secret) {
    delivery.webhook.secret = randomBytes(24).toString('hex');
  }

  return json(
    await updateWidget(widgetId, {
      name: body.name,
      enabled: body.enabled,
      config: body.config,
      delivery,
    }),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { widgetId } = await params;
  const widget = await getWidget(widgetId);

  if (!widget) {
    return notFound();
  }

  if (!(await canUpdateWebsite(auth, widget.websiteId))) {
    return unauthorized();
  }

  await deleteWidget(widgetId);
  return ok();
}
