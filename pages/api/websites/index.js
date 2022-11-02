import { createWebsite, getAllWebsites, getUserWebsites } from 'queries';
import { ok, methodNotAllowed, getRandomChars } from 'next-basics';
import { useAuth, useCors } from 'lib/middleware';
import { uuid } from 'lib/crypto';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  const { id, isAdmin } = req.auth;

  if (req.method === 'GET') {
    const { include_all } = req.query;

    const websites = isAdmin && include_all ? await getAllWebsites() : await getUserWebsites(id);

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    const { name, domain, enableShareUrl } = req.body;

    const shareId = enableShareUrl ? getRandomChars(8) : null;
    const website = await createWebsite(id, { id: uuid(), name, domain, shareId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
