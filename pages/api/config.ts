import { NextApiRequest, NextApiResponse } from 'next';
import { ok, methodNotAllowed } from 'next-basics';

export interface ConfigResponse {
  basePath: string;
  trackerScriptName: string;
  updatesDisabled: boolean;
  telemetryDisabled: boolean;
  cloudMode: boolean;
}

export default async (req: NextApiRequest, res: NextApiResponse<ConfigResponse>) => {
  if (req.method === 'GET') {
    return ok(res, {
      basePath: process.env.BASE_PATH || '',
      trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
      updatesDisabled: !!process.env.DISABLE_UPDATES,
      telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
      cloudMode: !!process.env.CLOUD_MODE,
    });
  }

  return methodNotAllowed(res);
};
