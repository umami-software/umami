import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteWebsite, getWebsite, getWebsiteById, updateWebsite } from 'queries';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { validate } from 'uuid';

export default async (req, res) => {
  const { id } = req.query;

  const websiteId = +id;
  const where = validate(id) ? { websiteUuid: id } : { id: +id };

  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const website = await getWebsite(where);

    return ok(res, website);
  }

  if (req.method === 'POST') {
    await useAuth(req, res);

    const { isAdmin: currentUserIsAdmin, userId: currentUserId } = req.auth;
    const { name, domain, owner, enable_share_url } = req.body;

    const website = await getWebsiteById(websiteId);

    if (website.userId !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    let { shareId } = website;

    if (enable_share_url) {
      shareId = shareId ? shareId : getRandomChars(8);
    } else {
      shareId = null;
    }

    await updateWebsite(websiteId, { name, domain, shareId, userId: +owner });

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
