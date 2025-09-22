import { NextResponse } from 'next/server';
import { notFound } from '@/lib/response';
import { findLink } from '@/queries';
import { POST } from '@/app/api/send/route';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const link = await findLink({
    where: {
      slug,
    },
  });

  if (!link) {
    return notFound();
  }

  const payload = {
    type: 'event',
    payload: {
      link: link.id,
      url: request.url,
      referrer: request.referrer,
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
