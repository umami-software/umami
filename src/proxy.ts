import { type NextRequest, NextResponse } from 'next/server';
import { getEmbedCsp } from '@/lib/embed-proxy';

/**
 * Per-share framing policy for /embed/<slug>, for deployments that do not use the Docker image
 * (the Docker build replaces this file with docker/proxy.ts, which applies the same policy).
 */
export const config = {
  matcher: '/embed/:path*',
};

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const csp = await getEmbedCsp(request.nextUrl.pathname);

  if (csp) {
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}
