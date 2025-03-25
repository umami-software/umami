'use server';

export async function getConfig() {
  return {
    telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
    uiDisabled: !!process.env.DISABLE_UI,
    updatesDisabled: !!process.env.DISABLE_UPDATES,
  };
}
