import { z } from 'zod';
import { publicWidget } from '@/lib/marketing-widgets';
import { json, notFound } from '@/lib/response';
import { getEnabledWidgets } from '@/queries/prisma';

/** Public: display configuration of the enabled widgets of a website. Never includes delivery settings. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;

  if (!z.uuid().safeParse(websiteId).success) {
    return notFound();
  }

  const widgets = await getEnabledWidgets(websiteId);
  const res = json({ widgets: widgets.map(publicWidget) });
  res.headers.set('Cache-Control', 'public, max-age=30');
  return res;
}
