'use server';

export type Config = {
  faviconUrl: string | undefined;
  loginDisabled: boolean;
  privateMode: boolean;
  telemetryDisabled: boolean;
  trackerScriptName: string | undefined;
  uiDisabled: boolean;
  updatesDisabled: boolean;
};

export async function getConfig(): Promise<Config> {
  return {
    faviconUrl: process.env.FAVICON_URL,
    loginDisabled: !!process.env.DISABLE_LOGIN,
    privateMode: !!process.env.PRIVATE_MODE,
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    uiDisabled: !!process.env.DISABLE_UI,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
  };
}
