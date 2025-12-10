import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import { json, notFound } from '@/lib/response';
import { getSharedWebsite } from '@/queries/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const website = await getSharedWebsite(shareId);

  if (!website) {
    return notFound();
  }

  const data = { websiteId: website.id };
  const token = createToken(data, secret());

  return json({ ...data, token });
}
