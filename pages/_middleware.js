import { NextResponse } from 'next/server';

function forceSSL(req) {
  if (process.env.FORCE_SSL && req.nextUrl.protocol === 'http:') {
    const response = NextResponse.next();

    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
  }
}

function customScriptName(req) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (pathname.endsWith(`/${scriptName}.js`)) {
      url.pathname = '/umami.js';
      return NextResponse.rewrite(url);
    }
  }
}

function disableLogin(req) {
  if (process.env.DISABLE_LOGIN && req.nextUrl.pathname.endsWith('/login')) {
    return new Response('403 Forbidden', { status: 403 });
  }
}

export function middleware(req) {
  const fns = [customScriptName, disableLogin, forceSSL];

  for (const fn of fns) {
    const res = fn(req);
    if (res) {
      return res;
    }
  }

  return NextResponse.next();
}
