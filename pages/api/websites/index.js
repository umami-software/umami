import { createWebsite, getUser, getAllWebsites, getUserWebsites } from 'queries';
import { ok, methodNotAllowed, unauthorized, getRandomChars } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, include_all } = req.query;
  const { userId: currentUserId, isAdmin } = req.auth;
  const id = user_id || currentUserId;
  let user;

  if (id) {
    user = await getUser({ id });
  }

  const userId = user ? user.id : user_id;

  if (req.method === 'GET') {
    if (userId && userId !== currentUserId && !isAdmin) {
      return unauthorized(res);
    }

    const websites =
      isAdmin && include_all ? await getAllWebsites() : await getUserWebsites({ userId });

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain, owner, enableShareUrl } = req.body;

    const website_owner = user ? userId : +owner;

    if (website_owner !== currentUserId && !isAdmin) {
      return unauthorized(res);
    }

    const shareId = enableShareUrl ? getRandomChars(8) : null;
    const website = await createWebsite(website_owner, { id: uuid(), name, domain, shareId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
