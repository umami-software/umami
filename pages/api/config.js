import { ok, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  if (req.method === 'GET') {
    return ok(res, {
      basePath: process.env.BASE_PATH || '',
      trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
      updatesDisabled: !!process.env.DISABLE_UPDATES,
      telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
    });
  }

  return methodNotAllowed(res);
};
