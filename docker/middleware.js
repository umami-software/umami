import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*',
};
const apiHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, DELETE, POST, PUT',
  },
  {
    key: 'Access-Control-Max-Age',
    value: process.env.CORS_MAX_AGE || '86400',
  },
];

function customCollectEndpoint(req) {
  const collectEndpoint = process.env.COLLECT_API_ENDPOINT;

  if (collectEndpoint) {
    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (pathname.endsWith(collectEndpoint)) {
      url.pathname = '/api/send';
      const resp = NextResponse.rewrite(url);
      apiHeaders.forEach(({ key, value }) => resp.headers.append(key, value));
      return resp;
    }
  }
}

function customScriptName(req) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    const names = scriptName.split(',').map(name => name.trim().replace(/^\/+/, ''));

    if (names.find(name => pathname.endsWith(name))) {
      url.pathname = '/script.js';
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
