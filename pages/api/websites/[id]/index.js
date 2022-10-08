import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteWebsite, getAccount, getWebsite, updateWebsite } from 'queries';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { validate } from 'uuid';

export default async (req, res) => {
  const { id } = req.query;

  const websiteId = +id;
  const where = validate(id) ? { website_uuid: id } : { website_id: +id };

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

    const { is_admin: currentUserIsAdmin, user_id: currentUserId, account_uuid } = req.auth;
    const { name, domain, owner, share_id } = req.body;
    let account;

    if (account_uuid) {
      account = await getAccount({ account_uuid });
    }

    const website = await getWebsite(where);

    if (website.user_id !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    await updateWebsite(
      {
        name,
        domain,
        share_id: share_id || null,
        user_id: account ? account.id : +owner,
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
