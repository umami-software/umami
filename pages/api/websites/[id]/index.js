import { methodNotAllowed, ok, unauthorized, getRandomChars } from 'next-basics';
import { deleteWebsite, getAccount, getWebsite, updateWebsite } from 'queries';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { validate } from 'uuid';

export default async (req, res) => {
  await useAuth(req, res);

  const { isAdmin, userId, accountUuid } = req.auth;

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
    const { name, domain, owner, enable_share_url } = req.body;
    let account;

    if (accountUuid) {
      account = await getAccount({ accountUuid });
    }

    const website = await getWebsite(where);

    const shareId = enable_share_url ? website.shareId || getRandomChars(8) : null;

    if (website.userId !== userId && !isAdmin) {
      return unauthorized(res);
    }

    await updateWebsite(
      {
        name,
        domain,
        shareId: shareId,
        userId: account ? account.id : +owner,
      },
      where,
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
