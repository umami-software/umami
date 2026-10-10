import { isApiKeyEnabled } from '@/lib/api-key';
import { parseRequest } from '@/lib/request';
import { notFound, ok } from '@/lib/response';
import { deleteApiKey } from '@/queries/prisma/apiKey';

export async function DELETE(request: Request, { params }: { params: Promise<{ keyId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!isApiKeyEnabled()) {
    return notFound();
  }

  const { keyId } = await params;

  const count = await deleteApiKey(keyId, auth.user.id);

  if (!count) {
    return notFound();
  }

  return ok();
}
