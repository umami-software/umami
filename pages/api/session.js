import { getWebsite, getSession, createSession } from 'lib/db';
import { hash, parseSessionRequest } from 'lib/utils';

export default async (req, res) => {
  let result = { time: Date.now() };
  const { website_id, session_id, browser, os, screen, language, country } = parseSessionRequest(
    req,
  );

  const website = await getWebsite(website_id);

  if (website) {
    const session = await getSession(session_id);

    if (!session) {
      await createSession(website_id, session_id, { browser, os, screen, language, country });
    }

    result = {
      ...result,
      session_id,
      website_id,
      hash: hash(`${website_id}${session_id}${result.time}`),
    };
  }

  res.status(200).json(result);
};
