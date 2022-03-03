import { NextResponse } from 'next/server';

function redirectHTTPS(req) {
  if (
    process.env.FORCE_SSL &&
    !req.headers.get('host').includes('localhost') &&
    req.nextUrl.protocol !== 'https'
  ) {
    return NextResponse.redirect(`https://${req.headers.get('host')}${req.nextUrl.pathname}`, 301);
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
