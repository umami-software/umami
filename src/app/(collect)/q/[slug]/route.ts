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

  if (isBot) {
    const ogTitle = escapeHtml(link.ogTitle || link.name);
    const ogDescription = escapeHtml(link.ogDescription || '');
    const ogImageUrl = escapeHtml(link.ogImageUrl || '');
    const ogDescriptionTag = ogDescription
      ? `<meta property="og:description" content="${ogDescription}">`
      : '';
    const ogImageTag = ogImageUrl ? `<meta property="og:image" content="${ogImageUrl}">` : '';
    const twitterCard = ogImageUrl ? 'summary_large_image' : 'summary';
    const metaDescriptionTag = ogDescription
      ? `<meta name="description" content="${ogDescription}">`
      : '';
    const twitterDescriptionTag = ogDescription
      ? `<meta name="twitter:description" content="${ogDescription}">`
      : '';
    const twitterImageTag = ogImageUrl ? `<meta name="twitter:image" content="${ogImageUrl}">` : '';

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${ogTitle}</title>

        <meta name="title" content="${ogTitle}">
        ${metaDescriptionTag}

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Umami">
        <meta property="og:title" content="${ogTitle}">
        <meta property="og:url" content="${request.url}">
        ${ogDescriptionTag}
        ${ogImageTag}

        <meta name="twitter:card" content="${twitterCard}">
        <meta name="twitter:title" content="${ogTitle}">
        ${twitterDescriptionTag}
        ${twitterImageTag}
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
