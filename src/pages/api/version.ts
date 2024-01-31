import { NextApiRequest, NextApiResponse } from 'next';
import { ok, methodNotAllowed } from 'next-basics';
import { CURRENT_VERSION } from 'lib/constants';

export interface VersionResponse {
  version: string;
}

export default async (req: NextApiRequest, res: NextApiResponse<VersionResponse>) => {
  if (req.method === 'GET') {
    return ok(res, {
      version: CURRENT_VERSION,
    });
  }

  return methodNotAllowed(res);
};
