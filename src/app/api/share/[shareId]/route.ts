import { json, notFound } from '@/lib/response';
import { createToken } from '@/lib/jwt';
import { secret } from '@/lib/crypto';
import { getSharedWebsite } from '@/queries';

export async function GET(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const website = await getSharedWebsite(shareId);

  if (!website) {
    return notFound();
  }

  const data = { websiteId: website.id };
  const token = createToken(data, secret());

  return json({ ...data, token });
}
