import { z } from 'zod';
import { fetchOgMetadata } from '@/lib/og';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { isHttpUrl } from '@/lib/url';

export async function GET(request: Request) {
  const schema = z.object({
    url: z.string().max(500),
  });

  const { auth, error, query } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  // Real users only; share-token holders shouldn't drive the OG fetcher.
  if (!auth?.user?.id) {
    return unauthorized();
  }

  if (!isHttpUrl(query.url)) {
    return badRequest({ message: 'url must be an http(s) URL' });
  }

  const result = await fetchOgMetadata(query.url);

  return json({
    title: result.title ?? null,
    description: result.description ?? null,
    image: result.image ?? null,
  });
}
