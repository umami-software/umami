import { getWebsites, updateWebsite } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id } = req.auth;
  const { website_id } = req.body;

  if (req.method === 'GET') {
    const websites = await getWebsites(user_id);

    return res.status(200).json(websites);
  }

  if (req.method === 'POST') {
    if (website_id) {
      const { name, domain } = req.body;
      const website = await updateWebsite(website_id, { name, domain });

      return res.status(200).json(website);
    }
  }

  return res.status(405).end();
};
