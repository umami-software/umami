import { getWebsite, getSession, createSession } from 'lib/db';
import { getCountry, getDevice, getIpAddress } from 'lib/request';
import { uuid, isValidId, verifyToken } from 'lib/crypto';

export async function verifySession(req) {
  const { payload } = req.body;
  const { website: website_uuid, hostname, screen, language, session } = payload;

  if (!isValidId(website_uuid)) {
    throw new Error(`Invalid website: ${website_uuid}`);
  }

  try {
    return await verifyToken(session);
  } catch {
    const ip = getIpAddress(req);
    const { userAgent, browser, os } = getDevice(req);
    const country = await getCountry(req, ip);

    if (website_uuid) {
      const website = await getWebsite({ website_uuid });

      if (website) {
        const { website_id } = website;
        const session_uuid = uuid(website_id, hostname, ip, userAgent, os);

        let session = await getSession({ session_uuid });

        if (!session) {
          session = await createSession(website_id, {
            session_uuid,
            hostname,
            browser,
            os,
            screen,
            language,
            country,
          });
        }

        const { session_id } = session;

        return {
          website_id,
          website_uuid,
          session_id,
          session_uuid,
        };
      } else {
        throw new Error(`Invalid website: ${website_uuid}`);
      }
    }
  }
}
