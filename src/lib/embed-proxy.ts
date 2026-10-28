import { getContentSecurityPolicy } from './csp';

/** Matches /embed/<slug>; slugs are free-form up to 100 chars (custom slugs are allowed). */
export const EMBED_PATH = /^\/embed\/([^/]{1,100})\/?$/;

const CACHE_MS = 15_000;
const cache = new Map<string, { value: string; expires: number }>();

async function getFrameAncestors(slug: string): Promise<string> {
  const cached = cache.get(slug);

  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  let value = "'none'";

  try {
    const basePath = process.env.BASE_PATH || '';
    const origin = `http://127.0.0.1:${process.env.PORT || 3000}${basePath}`;
    const res = await fetch(`${origin}/api/share/${encodeURIComponent(slug)}/embed`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();

      if (data?.enabled && typeof data.frameAncestors === 'string') {
        value = data.frameAncestors;
      }
    }
  } catch {
    // fail closed
  }

  if (cache.size > 500) {
    cache.clear();
  }

  cache.set(slug, { value, expires: Date.now() + CACHE_MS });
  return value;
}

/**
 * Content-Security-Policy for /embed/<slug> responses: only the origins the share owner approved
 * may frame the page. Returns null for any other path. `pathname` must already exclude BASE_PATH
 * (Next's request.nextUrl.pathname does).
 */
export async function getEmbedCsp(pathname: string): Promise<string | null> {
  const match = pathname.match(EMBED_PATH);

  if (!match) {
    return null;
  }

  let slug = match[1];

  try {
    slug = decodeURIComponent(slug);
  } catch {
    return getContentSecurityPolicy("'none'");
  }

  return getContentSecurityPolicy(await getFrameAncestors(slug));
}
