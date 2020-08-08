import { deleteWebsite, getWebsite } from 'lib/db';
import { useAuth } from 'lib/middleware';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, is_admin } = req.auth;
  const { id } = req.query;
  const website_id = +id;

  if (req.method === 'GET') {
    const website = await getWebsite({ website_id });

    return ok(res, website);
  }

  if (req.method === 'DELETE') {
    const website = await getWebsite({ website_id });

    if (website.user_id === user_id || is_admin) {
      await deleteWebsite(website_id);

      return ok(res);
    }

    return unauthorized(res);
  }

  return methodNotAllowed(res);
};
