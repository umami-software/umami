export const dynamic = 'force-dynamic';

import { isbot } from 'isbot';
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Link } from '@/generated/prisma/client';
import { getBaseUrl } from '@/lib/get-base-url';
import { renderOgHtml } from '@/lib/og-html';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
import { appendQueryParams } from '@/lib/url';
import { findLink } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let link: Link;

  if (redis.enabled) {
    link = await redis.client.fetch(
      `link:${slug}`,
      async () => {
        return findLink({
          where: {
            slug,
            deletedAt: null,
          },
        });
      },
      86400,
    );

    if (!link) {
      return notFound();
    }
  } else {
    link = await findLink({
      where: {
        slug,
        deletedAt: null,
      },
    });

    if (!link) {
      return notFound();
    }
  }

  const target = appendQueryParams(link.url, {
    utm_source: link.utmSource,
    utm_medium: link.utmMedium,
    utm_campaign: link.utmCampaign,
    utm_term: link.utmTerm,
    utm_content: link.utmContent,
  });

  const userAgent = request.headers.get('user-agent') ?? '';
  if (!process.env.DISABLE_BOT_CHECK && isbot(userAgent)) {
    const html = renderOgHtml(link, getBaseUrl(request.headers).origin, target);
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
        vary: 'User-Agent',
        // Strict CSP for the bot HTML; defense-in-depth if HTML escaping fails.
        'content-security-policy':
          "default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        'x-frame-options': 'DENY',
        'referrer-policy': 'no-referrer',
      },
    });
  }

  const payload = {
    type: 'event',
    payload: {
      link: link.id,
      url: request.url,
      referrer: request.headers.get("referer") || undefined,
    },
  };

  const req = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(payload),
  });

  await POST(req);

  return NextResponse.redirect(target);
}
