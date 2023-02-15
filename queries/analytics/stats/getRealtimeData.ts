import { getPageviews } from '../pageview/getPageviews';
import { getSessions } from '../session/getSessions';
import { getEvents } from '../event/getEvents';

export async function getRealtimeData(websiteId, time) {
  const [pageviews, sessions, events] = await Promise.all([
    getPageviews(websiteId, time),
    getSessions(websiteId, time),
    getEvents(websiteId, time),
  ]);

  return {
    pageviews: pageviews.map(({ id, ...props }) => ({
      __id: `p${id}`,
      pageviewId: id,
      ...props,
    })),
    sessions: sessions.map(({ id, ...props }) => ({
      __id: `s${id}`,
      sessionId: id,
      ...props,
    })),
    events: events.map(({ id, ...props }) => ({
      __id: `e${id}`,
      eventId: id,
      ...props,
    })),
    timestamp: Date.now(),
  };
}
