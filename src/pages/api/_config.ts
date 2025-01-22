import { NextApiRequest, NextApiResponse } from 'next';
import { ok, methodNotAllowed } from 'next-basics';

export interface ConfigResponse {
  telemetryDisabled: boolean;
  trackerScriptName: string;
  uiDisabled: boolean;
  updatesDisabled: boolean;
}

export default async (req: NextApiRequest, res: NextApiResponse<ConfigResponse>) => {
  if (req.method === 'GET') {
    return ok(res, {
      telemetryDisabled: !!process.env.DISABLE_TELEMETRY,
      trackerScriptName: process.env.TRACKER_SCRIPT_NAME,
      uiDisabled: !!process.env.DISABLE_UI,
      updatesDisabled: !!process.env.DISABLE_UPDATES,
    });
  }

  return methodNotAllowed(res);
};
