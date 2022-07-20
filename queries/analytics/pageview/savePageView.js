import { runQuery } from 'lib/queries';
import prisma from 'lib/db';
import { URL_LENGTH } from 'lib/constants';

export async function savePageView(website_id, session_id, url, referrer) {
  return runQuery(
    prisma.pageview.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        referrer: referrer?.substr(0, URL_LENGTH),
      },
    }),
  );
}
