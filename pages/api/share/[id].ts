import { NextApiRequestQueryBody } from 'lib/types';
import { secret } from 'lib/crypto';
import { NextApiResponse } from 'next';
import { createToken, methodNotAllowed, notFound, ok } from 'next-basics';
import { getWebsiteByShareId } from 'queries';

export interface ShareRequestQuery {
  id: string;
}

export interface ShareResponse {
  id: string;
  token: string;
}

export default async (
  req: NextApiRequestQueryBody<ShareRequestQuery>,
  res: NextApiResponse<ShareResponse>,
) => {
  const { id: shareId } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsiteByShareId(shareId);

    if (website) {
      const data = { websiteId: website.id };
      const token = createToken(data, secret());

      return ok(res, { ...data, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
