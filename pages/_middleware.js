import { NextResponse } from 'next/server';

function redirectHTTPS(req) {
  const host = req.headers.get('host');
  if (
    process.env.FORCE_SSL &&
    process.env.NODE_ENV === 'production' &&
    req.nextUrl.protocol === 'http:'
  ) {
    return NextResponse.redirect(`https://${host}${req.nextUrl.pathname}`, 301);
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
  const fns = [redirectHTTPS, customScriptName, disableLogin];

  for (const fn of fns) {
    const res = fn(req);
    if (res) {
      return res;
    }
  }

  return NextResponse.next();
}
