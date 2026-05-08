export interface OgRenderInput {
  name: string;
  url: string;
  slug: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(s: string): string {
  return s.replaceAll(/[&<>"']/g, c => ESCAPE_MAP[c]);
}

function metaProperty(property: string, value: string | undefined | null): string {
  if (!value) return '';
  return `<meta property="${escapeHtml(property)}" content="${escapeHtml(value)}">`;
}

function metaName(name: string, value: string | undefined | null): string {
  if (!value) return '';
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(value)}">`;
}

export function renderOgHtml(
  link: OgRenderInput,
  baseOrigin: string,
  finalDestinationUrl: string,
): string {
  let destHost = '';
  try {
    destHost = new URL(link.url).hostname;
  } catch {}

  const siteName = process.env.OG_SITE_NAME || 'Umami';
  const title = link.ogTitle || link.name;
  const description = link.ogDescription || (destHost ? `Redirects to ${destHost}` : '');
  // Empty image → omit og:image entirely; a broken URL is worse than no card.
  const image = link.ogImage || '';
  const basePath = process.env.basePath ?? '';
  const canonical = `${baseOrigin}${basePath}/q/${encodeURIComponent(link.slug)}`;

  const tags = [
    metaProperty('og:type', 'website'),
    metaProperty('og:site_name', siteName),
    metaProperty('og:title', title),
    metaProperty('og:description', description),
    metaProperty('og:image', image),
    metaProperty('og:url', canonical),
    metaName('twitter:card', image ? 'summary_large_image' : 'summary'),
    metaName('twitter:title', title),
    metaName('twitter:description', description),
    metaName('twitter:image', image),
  ]
    .filter(Boolean)
    .join('');

  const escapedTitle = escapeHtml(title);
  const escapedDestination = escapeHtml(finalDestinationUrl);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapedTitle}</title>${tags}<meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0; url=${escapedDestination}"></head><body><a href="${escapedDestination}">Continue</a></body></html>`;
}
