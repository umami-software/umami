import { getWebsites, updateWebsite, createWebsite, getWebsite } from 'lib/db';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';
import { ok, unauthorized, methodNotAllowed } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, is_admin } = req.auth;
  const { website_id } = req.body;

  if (req.method === 'GET') {
    const websites = await getWebsites(user_id);

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain } = req.body;

    if (website_id) {
      const website = getWebsite(website_id);

      if (website.user_id === user_id || is_admin) {
        await updateWebsite(website_id, { name, domain });

        return ok(res);
      }

      return unauthorized(res);
    } else {
      const website_uuid = uuid();
      const website = await createWebsite(user_id, { website_uuid, name, domain });

      return ok(res, website);
    }
  }

  return methodNotAllowed(res);
};
