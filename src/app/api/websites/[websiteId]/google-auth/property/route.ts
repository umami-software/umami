import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { updateWebsiteGoogleAuthProperty } from '@/queries/prisma';

const schema = z.object({
  propertyUrl: z.string().min(1).max(500),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { propertyUrl } = body;
  await updateWebsiteGoogleAuthProperty(websiteId, propertyUrl);

  return json({ ok: true, propertyUrl });
}
