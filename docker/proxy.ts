import { type NextRequest, NextResponse } from 'next/server';
import { getContentSecurityPolicy } from '@/lib/csp';
import { matchesConfiguredPath } from '@/lib/match-configured-path';

export const config = {
  matcher: '/:path*',
};

const TRACKER_PATH = '/script.js';
const RECORDER_PATH = '/recorder.js';
const COLLECT_PATH = '/api/send';
const LOGIN_PATH = '/login';
const BASE_PATH = process.env.BASE_PATH || '';

const apiHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, POST, PUT, PATCH, OPTIONS',
  'Access-Control-Max-Age': process.env.CORS_MAX_AGE || '86400',
  'Cache-Control': 'no-cache',
};

const trackerHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400, must-revalidate',
};

// Resolved once at startup — env vars don't change after the process starts.
const contentSecurityPolicy = getContentSecurityPolicy();

function customCollectEndpoint(request: NextRequest) {
  const collectEndpoint = process.env.COLLECT_API_ENDPOINT;

  if (collectEndpoint) {
    const url = request.nextUrl.clone();

    if (matchesConfiguredPath(url.pathname, collectEndpoint, BASE_PATH)) {
      url.pathname = COLLECT_PATH;
      return NextResponse.rewrite(url, { headers: apiHeaders });
    }
  }
}

function customScriptName(request: NextRequest) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = request.nextUrl.clone();
    const names = scriptName.split(',').map(name => name.trim().replace(/^\/+/, ''));

    if (names.find(name => matchesConfiguredPath(url.pathname, name, BASE_PATH))) {
      url.pathname = TRACKER_PATH;
      return NextResponse.rewrite(url, { headers: trackerHeaders });
    }
  }
}

function customScriptUrl(request: NextRequest) {
  const scriptUrl = process.env.TRACKER_SCRIPT_URL;

  if (scriptUrl && matchesConfiguredPath(request.nextUrl.pathname, TRACKER_PATH, BASE_PATH)) {
    return NextResponse.rewrite(scriptUrl, { headers: trackerHeaders });
  }
}

function applyStaticScriptHeaders(request: NextRequest, response: NextResponse) {
  if (
    matchesConfiguredPath(request.nextUrl.pathname, TRACKER_PATH, BASE_PATH) ||
    matchesConfiguredPath(request.nextUrl.pathname, RECORDER_PATH, BASE_PATH)
  ) {
    Object.entries(trackerHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}

function disableLogin(request: NextRequest) {
  const loginDisabled = process.env.DISABLE_LOGIN;

  if (loginDisabled && matchesConfiguredPath(request.nextUrl.pathname, LOGIN_PATH, BASE_PATH)) {
    return new NextResponse('Access denied', { status: 403 });
  }
}

// --- Embeddable widgets: /embed/<slug> may only be framed by origins the share owner approved. ---
const EMBED_PATH = /^\/embed\/([a-zA-Z0-9]{8,50})\/?$/;
const EMBED_CACHE_MS = 15_000;
const embedCache = new Map<string, { value: string; expires: number }>();

async function getEmbedFrameAncestors(slug: string): Promise<string> {
  const cached = embedCache.get(slug);

  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  let value = "'none'";

  try {
    const origin = `http://127.0.0.1:${process.env.PORT || 3000}${BASE_PATH}`;
    const res = await fetch(`${origin}/api/share/${slug}/embed`, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();

      if (data?.enabled && typeof data.frameAncestors === 'string') {
        value = data.frameAncestors;
      }
    }
  } catch {
    // fail closed
  }

  if (embedCache.size > 500) {
    embedCache.clear();
  }

  embedCache.set(slug, { value, expires: Date.now() + EMBED_CACHE_MS });
  return value;
}

export default async function middleware(req: NextRequest) {
  const fns = [customCollectEndpoint, customScriptName, customScriptUrl, disableLogin];

  let res: NextResponse | undefined;

  for (const fn of fns) {
    res = fn(req);
    if (res) {
      break;
    }
  }

  res ??= NextResponse.next();
  applyStaticScriptHeaders(req, res);

  // Set the CSP here, not only at build time in next.config.ts, so
  // ALLOWED_FRAME_URLS is resolved from the runtime environment.
  const embedMatch = req.nextUrl.pathname.replace(BASE_PATH, '').match(EMBED_PATH);

  if (embedMatch) {
    res.headers.set(
      'Content-Security-Policy',
      getContentSecurityPolicy(await getEmbedFrameAncestors(embedMatch[1])),
    );
  } else {
    res.headers.set('Content-Security-Policy', contentSecurityPolicy);
  }

  return res;
}
