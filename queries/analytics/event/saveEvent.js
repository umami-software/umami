import { runQuery } from 'lib/queries';
import prisma from 'lib/db';
import { URL_LENGTH } from 'lib/constants';

export async function saveEvent(website_id, session_id, url, event_type, event_value) {
  return runQuery(
    prisma.event.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        event_type: event_type?.substr(0, 50),
        event_value: event_value?.substr(0, 50),
      },
    }),
  );
}
