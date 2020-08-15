import { getWebsiteByShareId } from 'lib/queries';
import { ok, notFound, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const website = await getWebsiteByShareId(id);

    if (website) {
      return ok(res, website);
    }

    return notFound(res);
  }

  return methodNotAllowed(res);
};
