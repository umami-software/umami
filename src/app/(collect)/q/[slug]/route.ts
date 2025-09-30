export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { notFound } from '@/lib/response';
import { findLink } from '@/queries/prisma';
import { POST } from '@/app/api/send/route';
import { Link } from '@/generated/prisma/client';
import redis from '@/lib/redis';

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
