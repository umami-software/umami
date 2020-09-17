import { deleteWebsite, getWebsiteById } from 'lib/queries';
import { useAuth } from 'lib/middleware';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, is_admin } = req.auth;
  const { id, share_id } = req.query;
  const websiteId = +id;

  const website = await getWebsiteById(websiteId);

  if (req.method === 'GET') {
    if (is_admin || website.user_id === user_id || (share_id && website.share_id === share_id)) {
      return ok(res, website);
    }
    return unauthorized(res);
  }

  if (req.method === 'DELETE') {
    if (is_admin || website.user_id === user_id) {
      await deleteWebsite(websiteId);

      return ok(res);
    }
    return unauthorized(res);
  }

  return methodNotAllowed(res);
};
