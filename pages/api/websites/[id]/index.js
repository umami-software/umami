import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getRandomChars, methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { deleteWebsite, getAccount, getWebsite, updateWebsite } from 'queries';
import { TYPE_WEBSITE } from 'lib/constants';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id: websiteUuid } = req.query;

  if (req.method === 'GET') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const website = await getWebsite({ websiteUuid });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    if (!(await allowQuery(req, TYPE_WEBSITE, false))) {
      return unauthorized(res);
    }

    const { name, domain, owner, enableShareUrl, shareId } = req.body;
    const { accountUuid } = req.auth;

    let account;

    if (accountUuid) {
      account = await getAccount({ accountUuid });

      if (!account) {
        return serverError(res, 'Account does not exist.');
      }
    }

    const website = await getWebsite({ websiteUuid });

    const newShareId = enableShareUrl ? website.shareId || getRandomChars(8) : null;

    try {
      await updateWebsite(
        {
          name,
          domain,
          shareId: shareId && enableShareUrl === undefined ? shareId : newShareId,
          userId: +owner || account.id,
        },
        { websiteUuid },
      );
    } catch (e) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res);
  }

  if (req.method === 'DELETE') {
    if (!(await allowQuery(req, TYPE_WEBSITE, false))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteUuid);

    return ok(res);
  }

  return methodNotAllowed(res);
};
