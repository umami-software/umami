import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getRandomChars, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteWebsite, getAccount, getWebsite, getWebsiteByUuid, updateWebsite } from 'queries';

export default async (req, res) => {
  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const website = await getWebsiteByUuid(websiteId);

    return ok(res, website);
  }

  if (req.method === 'POST') {
    await useAuth(req, res);

    const { isAdmin: currentUserIsAdmin, userId: currentUserId, accountUuid } = req.auth;
    const { name, domain, owner, enable_share_url } = req.body;
    let account;

    if (accountUuid) {
      account = await getAccount({ accountUuid });
    }

    const website = await getWebsite(websiteId);

    const shareId = enable_share_url ? website.shareId || getRandomChars(8) : null;

    if (website.userId !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    await updateWebsite(
      {
        name,
        domain,
        shareId: shareId,
        userId: account ? account.id : +owner,
      },
      { websiteUuid: websiteId },
    );

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
