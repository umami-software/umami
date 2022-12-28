import { createWebsite, getAccount, getAllWebsites, getUserWebsites } from 'queries';
import { ok, methodNotAllowed, unauthorized, getRandomChars } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { uuid } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id, include_all } = req.query;
  const { userId: currentUserId, isAdmin } = req.auth;
  const accountUuid = user_id || req.auth.accountUuid;
  let account;

  if (accountUuid) {
    account = await getAccount({ accountUuid });
  }

  const userId = account ? account.id : user_id;

  if (req.method === 'GET') {
    if (userId && userId !== currentUserId && !isAdmin) {
      return unauthorized(res);
    }

    const websites =
      isAdmin && include_all
        ? await getAllWebsites()
        : await getUserWebsites({ userId: account?.id });

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain, owner, enableShareUrl } = req.body;

    const website_owner = account ? account.id : +owner;

    if (website_owner !== currentUserId && !isAdmin) {
      return unauthorized(res);
    }

    const websiteUuid = uuid();
    const shareId = enableShareUrl ? getRandomChars(8) : null;
    const website = await createWebsite(website_owner, { websiteUuid, name, domain, shareId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
