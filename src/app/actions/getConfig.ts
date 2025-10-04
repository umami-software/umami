'use server';

export type Config = {
  faviconUrl: string | undefined;
  privateMode: boolean;
  telemetryDisabled: boolean;
  trackerScriptName: string | undefined;
  updatesDisabled: boolean;
};

export async function getConfig(): Promise<Config> {
  return {
    faviconUrl: process.env.FAVICON_URL,
    privateMode: !!process.env.PRIVATE_MODE,
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
  };
}
