export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Link } from '@/generated/prisma/client';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
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
  const l = link;
  if (isBot && (l.title || l.description || l.image)) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta property="og:title" content="${l.title || l.name}">
        <meta property="og:description" content="${l.description || ''}">
        <meta property="og:image" content="${l.image || ''}">
        <meta property="og:url" content="${l.url}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${l.title || l.name}">
        <meta name="twitter:description" content="${l.description || ''}">
        <meta name="twitter:image" content="${l.image || ''}">
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
