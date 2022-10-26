import { getWebsite } from 'queries';
import { ok, notFound, methodNotAllowed, createToken } from 'next-basics';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsite({ shareId: id });

    if (website) {
      const { websiteUuid } = website;
      const data = { id: websiteUuid };
      const token = createToken(data, secret());

      return ok(res, { ...data, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
