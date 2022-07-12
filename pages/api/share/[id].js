import { getWebsiteByShareId } from 'queries';
import { ok, notFound, methodNotAllowed } from 'lib/response';
import { createToken } from 'lib/crypto';

export default async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsiteByShareId(id);

    if (website) {
      const websiteId = website.website_id;
      const token = await createToken({ website_id: websiteId });

      return ok(res, { websiteId, token });
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
