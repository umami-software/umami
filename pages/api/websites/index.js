import { createWebsite, getAccount, getAllWebsites, getUserWebsites } from 'queries';
import { ok, methodNotAllowed, unauthorized, getRandomChars } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id: current_user_id, is_admin, account_uuid } = req.auth;
  const { user_id, include_all } = req.query;
  let account;

  if (account_uuid) {
    account = await getAccount({ account_uuid });
  }

  const userId = account ? account.user_id : +user_id;

  if (req.method === 'GET') {
    if (userId && userId !== current_user_id && !is_admin) {
      return unauthorized(res);
    }

    const websites =
      is_admin && include_all
        ? await getAllWebsites()
        : await getUserWebsites(userId || current_user_id);

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    await useAuth(req, res);

    const { is_admin: currentUserIsAdmin, user_id: currentUserId } = req.auth;
    const { name, domain, owner, enable_share_url } = req.body;

    const website_owner = account ? account.user_id : +owner;

    if (website_owner !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    const website_uuid = uuid();
    const share_id = enable_share_url ? getRandomChars(8) : null;
    const website = await createWebsite(website_owner, { website_uuid, name, domain, share_id });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
