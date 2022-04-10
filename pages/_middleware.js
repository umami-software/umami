import { NextResponse } from 'next/server';

function customScriptName(req) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    const names = scriptName.split(',').map(name => (name + '.js').trim());

    if (names.find(name => pathname.endsWith(name))) {
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

function forceSSL(req, res) {
  if (process.env.FORCE_SSL && req.nextUrl.protocol === 'http:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return res;
}

export function middleware(req) {
  const fns = [customScriptName, disableLogin];

  for (const fn of fns) {
    const res = fn(req);
    if (res) {
      return res;
    }
  }

  return forceSSL(req, NextResponse.next());
}
