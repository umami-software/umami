export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Link } from '@/generated/prisma/client';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
import { findLink } from '@/queries/prisma';

const BOT_UA_REGEX =
  /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchOgTags(
  url: string,
): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'facebookexternalhit/1.1' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return {};

    const html = await res.text();
    const get = (property: string) => {
      const match =
        html.match(
          new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        ) ||
        html.match(
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
        );
      return match?.[1];
    };

    return {
      title: get('og:title'),
      description: get('og:description'),
      image: get('og:image'),
    };
  } catch {
    return {};
  }
}

function ogResponse(
  link: Link,
  og: { title?: string; description?: string; image?: string },
): Response {
  const title = og.title || link.name;
  const description = og.description || '';
  const image = og.image || '';
  const url = link.url;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${escapeHtml(title)}" />
  ${description ? `<meta property="og:description" content="${escapeHtml(description)}" />` : ''}
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:type" content="website" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
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

  // For bots, serve HTML with OG tags fetched from the destination URL
  const ua = request.headers.get('user-agent') || '';
  if (BOT_UA_REGEX.test(ua)) {
    const og = await fetchOgTags(link.url);
    return ogResponse(link, og);
  }

  // Track the click (skip for bots above)
  const payload = {
    type: 'event',
    payload: {
      link: link.id,
      url: request.url,
      referrer: request.headers.get('referer') ?? undefined,
    },
  };

  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');

  const req = new Request(request.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  await POST(req);

  return NextResponse.redirect(link.url);
}
