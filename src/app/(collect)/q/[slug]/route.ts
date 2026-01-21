export const dynamic = 'force-dynamic';

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
  const isBot =
    /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|telegrambot|applebot|bingbot|googlebot/i.test(
      userAgent,
    );

  if (isBot && (link.ogTitle || link.ogDescription || link.ogImageUrl)) {
    const ogTitle = escapeHtml(link.ogTitle || link.name);
    const ogDescription = escapeHtml(link.ogDescription || '');
    const ogImageUrl = escapeHtml(link.ogImageUrl || '');
    const url = escapeHtml(link.url);

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${ogTitle}</title>
        <meta property="og:title" content="${ogTitle}">
        <meta property="og:description" content="${ogDescription}">
        <meta property="og:image" content="${ogImageUrl}">
        <meta property="og:url" content="${url}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${ogTitle}">
        <meta name="twitter:description" content="${ogDescription}">
        <meta name="twitter:image" content="${ogImageUrl}">
      </head>
      <body></body>
      </html>
    `,
      {
        headers: {
          'content-type': 'text/html',
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
