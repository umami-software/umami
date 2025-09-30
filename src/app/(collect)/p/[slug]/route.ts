export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { notFound } from '@/lib/response';
import redis from '@/lib/redis';
import { findPixel } from '@/queries/prisma';
import { Pixel } from '@/generated/prisma/client';
import { POST } from '@/app/api/send/route';

const image = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw', 'base64');

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let pixel: Pixel;

  if (redis.enabled) {
    pixel = await redis.client.fetch(
      `pixel:${slug}`,
      async () => {
        return findPixel({
          where: {
            slug,
          },
        });
      },
      86400,
    );

    if (!pixel) {
      return notFound();
    }
  } else {
    pixel = await findPixel({
      where: {
        slug,
      },
    });

    if (!pixel) {
      return notFound();
    }
  }

  const payload = {
    type: 'event',
    payload: {
      pixel: pixel.id,
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

  return new NextResponse(image, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': image.length.toString(),
    },
  });
}
