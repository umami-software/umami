import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteWebsite, getWebsiteById, updateWebsite } from 'queries';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';

export default async (req, res) => {
  const { id } = req.query;

  const websiteId = +id;

  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const website = await getWebsiteById(websiteId);

    return ok(res, website);
  }

  if (req.method === 'POST') {
    await useAuth(req, res);

    const { is_admin: currentUserIsAdmin, user_id: currentUserId } = req.auth;
    const { name, domain, owner, enable_share_url } = req.body;

    const website = await getWebsiteById(websiteId);

    if (website.user_id !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    let { share_id } = website;

    if (enable_share_url) {
      share_id = share_id ? share_id : getRandomChars(8);
    } else {
      share_id = null;
    }

    await updateWebsite(websiteId, { name, domain, share_id, user_id: +owner });

    return ok(res);
  }

  if (req.method === 'DELETE') {
    if (!(await allowQuery(req, true))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
