import { secret } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { createToken, methodNotAllowed, notFound, ok } from 'next-basics';
import { getSharedWebsite } from 'queries';
import * as yup from 'yup';

export interface ShareRequestQuery {
  shareId: string;
}

export interface ShareResponse {
  shareId: string;
  token: string;
}

const schema = {
  GET: yup.object().shape({
    shareId: yup.string().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<ShareRequestQuery>,
  res: NextApiResponse<ShareResponse>,
) => {
  await useValidate(schema, req, res);

  const { shareId } = req.query;

  if (req.method === 'GET') {
    const website = await getSharedWebsite(shareId);

    if (website) {
      const data = { websiteId: website.id };
      const token = createToken(data, secret());

      return ok(res, { ...data, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
