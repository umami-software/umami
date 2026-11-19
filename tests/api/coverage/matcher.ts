export type PathMatcher = (url: string) => string | null;

/** Strips origin, query string, hash and trailing slashes from a URL or path. */
export function getPathname(url: string): string {
  const raw = /^https?:\/\//i.test(url) ? new URL(url).pathname : url.split(/[?#]/)[0];

  return raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
}

/**
 * Maps a concrete request path back to an OpenAPI path template.
 *
 * Candidates must have the same number of segments. A literal segment match
 * scores higher than a `{param}` match, so `/api/websites/charts` resolves to
 * `/api/websites/charts` rather than `/api/websites/{websiteId}`, and
 * `/api/reports/funnel` beats `/api/reports/{reportId}`.
 */
export function createMatcher(templates: string[]): PathMatcher {
  const candidates = [...new Set(templates)].map(template => ({
    template,
    segments: template.split('/').filter(Boolean),
  }));

  return url => {
    const segments = getPathname(url).split('/').filter(Boolean);
    let best: { template: string; score: number } | null = null;

    for (const candidate of candidates) {
      if (candidate.segments.length !== segments.length) {
        continue;
      }

      let score = 0;
      let matches = true;

      for (let i = 0; i < segments.length; i++) {
        const expected = candidate.segments[i];
        const actual = segments[i];

        if (expected === actual) {
          score += 1;
        } else if (expected.startsWith('{') && expected.endsWith('}') && actual) {
          // parameter segment: matches anything non-empty
        } else {
          matches = false;
          break;
        }
      }

      if (matches && (!best || score > best.score)) {
        best = { template: candidate.template, score };
      }
    }

    return best?.template ?? null;
  };
}
