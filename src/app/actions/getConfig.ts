'use server';

export type Config = {
  faviconUrl?: string;
  privateMode: boolean;
  telemetryDisabled: boolean;
  trackerScriptName?: string;
  updatesDisabled: boolean;
  linkDomain?: string;
  pixelDomain?: string;
};

export async function getConfig(): Promise<Config> {
  return {
    faviconUrl: process.env.FAVICON_URL,
    privateMode: !!process.env.PRIVATE_MODE,
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
    linkDomain: process.env.LINK_DOMAIN,
    pixelDomain: process.env.PIXEL_DOMAIN,
  };
}
