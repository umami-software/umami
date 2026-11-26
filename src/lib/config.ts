import { isRelationalOnly } from '@/lib/db';

export type Config = {
  cloudMode: boolean;
  faviconUrl?: string;
  linksUrl?: string;
  pixelsUrl?: string;
  privateMode: boolean;
  sessionDeletionEnabled: boolean;
  settingsEnabled: boolean;
  telemetryDisabled: boolean;
  trackerScriptName?: string;
  updatesDisabled: boolean;
};

/**
 * Server-side only. Reads runtime environment values that the client needs.
 * Must be called at request time (not build time) so Docker/runtime env is honored.
 */
export function getConfig(): Config {
  const cloudMode = !!process.env.CLOUD_MODE;
  const enableSettings = ['1', 'true'].includes(process.env.ENABLE_SETTINGS);

  return {
    cloudMode,
    faviconUrl: process.env.FAVICON_URL,
    linksUrl: process.env.LINKS_URL,
    pixelsUrl: process.env.PIXELS_URL,
    privateMode: !!process.env.PRIVATE_MODE,
    sessionDeletionEnabled: isRelationalOnly(),
    settingsEnabled: !cloudMode || enableSettings,
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
  };
}
