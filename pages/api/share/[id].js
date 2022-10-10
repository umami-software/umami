import { getWebsiteByShareId } from 'queries';
import { ok, notFound, methodNotAllowed, createToken } from 'next-basics';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsiteByShareId(id);

    if (website) {
      const websiteId = website.websiteId;
      const token = createToken({ websiteId: websiteId }, secret());

      return ok(res, { websiteId, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
