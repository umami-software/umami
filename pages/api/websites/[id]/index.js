import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getRandomChars, methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { deleteWebsite, getUser, getWebsite, updateWebsite } from 'queries';
import { TYPE_WEBSITE } from 'lib/constants';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id } = req.query;

  if (!(await allowQuery(req, TYPE_WEBSITE))) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const website = await getWebsite({ id });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const { name, domain, owner, enableShareUrl, shareId } = req.body;
    const { userId } = req.auth;
    let user;

    if (userId) {
      user = await getUser({ id: userId });

      if (!user) {
        return serverError(res, 'User does not exist.');
      }
    }

    const website = await getWebsite({ id });

    const newShareId = enableShareUrl ? website.shareId || getRandomChars(8) : null;

    try {
      await updateWebsite(
        {
          name,
          domain,
          shareId: shareId ? shareId : newShareId,
          userId: +owner || user.id,
        },
        { id },
      );
    } catch (e) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }
    }

    return ok(res);
  }

  if (req.method === 'DELETE') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    await deleteWebsite(id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
