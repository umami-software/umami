import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    const names = scriptName.split(',').map(name => name.trim() + '.js');

    if (names.find(name => pathname.endsWith(name))) {
      url.pathname = '/script.js';
      return NextResponse.rewrite(url);
    }
  }
}

export const config = {
  matcher: '/:path*',
};
