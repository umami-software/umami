import { NextApiRequest, NextApiResponse } from 'next';
import { ok } from 'next-basics';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return ok(res);
};
