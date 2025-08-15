import { z } from 'zod';
import { canUpdatePixel, canDeletePixel, canViewPixel } from '@/validations';
import { parseRequest } from '@/lib/request';
import { ok, json, unauthorized, serverError, badRequest } from '@/lib/response';
import { deletePixel, getPixel, updatePixel } from '@/queries';

export async function GET(request: Request, { params }: { params: Promise<{ pixelId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { pixelId } = await params;

  if (!(await canViewPixel(auth, pixelId))) {
    return unauthorized();
  }

  const pixel = await getPixel(pixelId);

  return json(pixel);
}

export async function POST(request: Request, { params }: { params: Promise<{ pixelId: string }> }) {
  const schema = z.object({
    name: z.string(),
    slug: z.string().min(8),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { pixelId } = await params;
  const { name, slug } = body;

  if (!(await canUpdatePixel(auth, pixelId))) {
    return unauthorized();
  }

  try {
    const pixel = await updatePixel(pixelId, { name, slug });

    return Response.json(pixel);
  } catch (e: any) {
    if (e.message.includes('Unique constraint') && e.message.includes('slug')) {
      return badRequest('That slug is already taken.');
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pixelId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { pixelId } = await params;

  if (!(await canDeletePixel(auth, pixelId))) {
    return unauthorized();
  }

  await deletePixel(pixelId);

  return ok();
}
