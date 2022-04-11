import { getWebsiteByUuid, getSessionByUuid, createSession } from 'lib/queries';
import { getJsonBody, getClientInfo } from 'lib/request';
import { uuid, isValidUuid, parseToken } from 'lib/crypto';

export async function getSession(req) {
  const { payload } = getJsonBody(req);

  if (!payload) {
    throw new Error('Invalid request');
  }

  const { website: website_uuid, hostname, screen, language } = payload;
  const cache = req.headers['x-umami-cache'];

  if (cache) {
    const result = await parseToken(cache);

    if (result) {
      return result;
    }
  }

  if (!isValidUuid(website_uuid)) {
    throw new Error(`Invalid website: ${website_uuid}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);

  const website = await getWebsiteByUuid(website_uuid);

  if (!website) {
    throw new Error(`Website not found: ${website_uuid}`);
  }

  const { website_id } = website;
  const session_uuid = uuid(website_id, hostname, ip, userAgent);

  let session = await getSessionByUuid(session_uuid);

  if (!session) {
    try {
      session = await createSession(website_id, {
        session_uuid,
        hostname,
        browser,
        os,
        screen,
        language,
        country,
        device,
      });

      if (!session) {
        return null;
      }
    } catch (e) {
      if (!e.message.includes('Unique constraint')) {
        throw e;
      }
    }
  }

  const { session_id } = session;

  return {
    website_id,
    session_id,
  };
}
