export const dynamic = 'force-dynamic';

import { isbot } from 'isbot';
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Link } from '@/generated/prisma/client';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
import { findLink } from '@/queries/prisma';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

function metaTag(property: string, content: string | undefined, isName = false): string {
  if (!content) return '';
  const escaped = escapeHtml(content);
  return isName
    ? `<meta name="${property}" content="${escaped}">`
    : `<meta property="${property}" content="${escaped}">`;
}

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
      },
    });

    if (!link) {
      return notFound();
    }
  }

  const userAgent = request.headers.get('user-agent') || '';

  if (isbot(userAgent)) {
    const ogTitle = link.ogTitle || link.name;
    const ogDescription = link.ogDescription || undefined;
    const ogImageUrl = link.ogImageUrl || undefined;
    const twitterCard = ogImageUrl ? 'summary_large_image' : 'summary';

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(ogTitle)}</title>
        ${metaTag('title', ogTitle, true)}
        ${metaTag('description', ogDescription, true)}
        ${metaTag('og:type', 'website')}
        ${metaTag('og:site_name', 'Umami')}
        ${metaTag('og:title', ogTitle)}
        ${metaTag('og:url', request.url)}
        ${metaTag('og:description', ogDescription)}
        ${metaTag('og:image', ogImageUrl)}
        <meta name="twitter:card" content="${twitterCard}">
        ${metaTag('twitter:title', ogTitle, true)}
        ${metaTag('twitter:description', ogDescription, true)}
        ${metaTag('twitter:image', ogImageUrl, true)}
      </head>
      <body>
        <p>Redirecting to ${escapeHtml(link.url)}...</p>
      </body>
      </html>
      `,
      {
        headers: {
          'content-type': 'text/html',
          'cache-control': 's-maxage=300, stale-while-revalidate',
        },
      },
    );
  }

  const payload = {
    type: 'event',
    payload: {
      link: link.id,
      url: request.url,
      referrer: request.headers.get('referer'),
    },
  };

  const req = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(payload),
  });

  await POST(req);

  return NextResponse.redirect(link.url);
}
