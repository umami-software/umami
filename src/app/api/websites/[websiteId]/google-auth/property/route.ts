import { Prisma } from '@/generated/prisma/client';
import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, notFound, serverError, unauthorized } from '@/lib/response';
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

  try {
    await updateWebsiteGoogleAuthProperty(websiteId, propertyUrl);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return notFound();
    }
    return serverError();
  }

  return json({ ok: true, propertyUrl });
}
