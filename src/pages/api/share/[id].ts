import { secret } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { createToken, methodNotAllowed, notFound, ok } from 'next-basics';
import { getWebsiteByShareId } from 'queries';
import * as yup from 'yup';

export interface ShareRequestQuery {
  id: string;
}

export interface ShareResponse {
  id: string;
  token: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<ShareRequestQuery>,
  res: NextApiResponse<ShareResponse>,
) => {
  await useValidate(schema, req, res);

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
