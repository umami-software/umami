import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import { json, notFound } from '@/lib/response';
import { getShareByCode } from '@/queries/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const share = await getShareByCode(slug);

  if (!share) {
    return notFound();
  }

  const data = {
    shareId: share.id,
    websiteId: share.entityId,
    parameters: share.parameters,
  };
  const token = createToken(data, secret());

  return json({ ...data, token });
}
