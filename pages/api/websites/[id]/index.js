import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getRandomChars, methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { deleteWebsite, getAccount, getWebsite, updateWebsite } from 'queries';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteId } = req.query;

  if (!(await allowQuery(req))) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const website = await getWebsite({ websiteUuid: websiteId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const { name, domain, owner, enableShareUrl, shareId } = req.body;
    const { accountUuid } = req.auth;
    let account;

    if (accountUuid) {
      account = await getAccount({ accountUuid });

      if (!account) {
        return serverError(res, 'Account does not exist.');
      }
    }

    const website = await getWebsite({ websiteUuid: websiteId });

    const newShareId = enableShareUrl ? website.shareId || getRandomChars(8) : null;

    try {
      await updateWebsite(
        {
          name,
          domain,
          shareId: shareId ? shareId : newShareId,
          userId: account ? account.id : +owner || undefined,
        },
        { websiteUuid: websiteId },
      );
    } catch (e) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

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
