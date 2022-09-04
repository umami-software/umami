import { ok, unauthorized, methodNotAllowed, getRandomChars } from 'next-basics';
import { updateWebsite, createWebsite, getWebsiteById } from 'queries';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, is_admin } = req.auth;
  const { website_id, enable_share_url } = req.body;

  if (req.method === 'POST') {
    const { name, domain, owner } = req.body;
    const website_owner = parseInt(owner);

    if (website_id) {
      const website = await getWebsiteById(website_id);

      if (website.user_id !== user_id && !is_admin) {
        return unauthorized(res);
      }

      let { share_id } = website;

      if (enable_share_url) {
        share_id = share_id ? share_id : getRandomChars(8);
      } else {
        share_id = null;
      }

      await updateWebsite(website_id, { name, domain, share_id, user_id: website_owner });

      return ok(res);
    } else {
      const website_uuid = uuid();
      const share_id = enable_share_url ? getRandomChars(8) : null;
      const website = await createWebsite(website_owner, { website_uuid, name, domain, share_id });

      return ok(res, website);
    }
  }

  return methodNotAllowed(res);
};
