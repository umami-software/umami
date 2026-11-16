import { isRelationalOnly } from '@/lib/db';

export type Config = {
  cloudMode: boolean;
  faviconUrl?: string;
  linksUrl?: string;
  linksUrls: string[];
  pixelsUrl?: string;
  privateMode: boolean;
  sessionDeletionEnabled: boolean;
  telemetryDisabled: boolean;
  trackerScriptName?: string;
  updatesDisabled: boolean;
};

/**
 * LINKS_URL accepts a comma-separated list of short link base urls.
 * The first entry is the default for links that have not chosen one.
 */
export function getLinksUrls(value = process.env.LINKS_URL): string[] {
  return (value ?? '')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);
}

/**
 * Server-side only. Reads runtime environment values that the client needs.
 * Must be called at request time (not build time) so Docker/runtime env is honored.
 */
export function getConfig(): Config {
  const linksUrls = getLinksUrls();

  return {
    cloudMode: !!process.env.CLOUD_MODE,
    faviconUrl: process.env.FAVICON_URL,
    linksUrl: linksUrls[0],
    linksUrls,
    pixelsUrl: process.env.PIXELS_URL,
    privateMode: !!process.env.PRIVATE_MODE,
    sessionDeletionEnabled: isRelationalOnly(),
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
  };
}
