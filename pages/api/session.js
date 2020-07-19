import { getWebsite, getSession, createSession } from 'lib/db';
import { hash, parseSessionRequest } from 'lib/utils';
import { allowPost } from 'lib/middleware';

export default async (req, res) => {
  await allowPost(req, res);

  let result = { success: 0 };

  const {
    website_id,
    session_id,
    hostname,
    browser,
    os,
    screen,
    language,
    country,
  } = await parseSessionRequest(req);

  if (website_id && session_id) {
    const website = await getWebsite(website_id);

    if (website) {
      const session = await getSession(session_id);
      const time = Date.now();

      if (!session) {
        await createSession(website_id, session_id, {
          hostname,
          browser,
          os,
          screen,
          language,
          country,
        });
      }

      result = {
        ...result,
        success: 1,
        session_id,
        website_id,
        time,
        hash: hash(`${website_id}${session_id}${time}`),
      };
    }
  }

  res.status(200).json(result);
};
