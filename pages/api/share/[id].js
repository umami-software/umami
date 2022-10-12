import { getWebsiteByShareId } from 'queries';
import { ok, notFound, methodNotAllowed, createToken } from 'next-basics';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsiteByShareId(id);

    if (website) {
      const { websiteId, websiteUuid } = website;
      const token = createToken({ websiteId, websiteUuid }, secret());

      return ok(res, { websiteId, websiteUuid, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
