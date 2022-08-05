import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*',
};

function customCollectEndpoint(req) {
  const collectEndpoint = process.env.COLLECT_API_ENDPOINT;

  if (collectEndpoint) {
    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (pathname.endsWith(collectEndpoint)) {
      url.pathname = '/api/collect';
      return NextResponse.rewrite(url);
    }
  }
}

function customScriptName(req) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    const names = scriptName.split(',').map(name => name.trim() + '.js');

    if (names.find(name => pathname.endsWith(name))) {
      url.pathname = '/umami.js';
      return NextResponse.rewrite(url);
    }
  }
}

export default function middleware(req) {
  const fns = [customCollectEndpoint, customScriptName];

  for (const fn of fns) {
    const res = fn(req);
    if (res) {
      return res;
    }
  }

  return NextResponse.next();
}
