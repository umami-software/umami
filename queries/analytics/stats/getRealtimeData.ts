import { getPageviews } from '../pageview/getPageviews';
import { getSessions } from '../session/getSessions';
import { getEvents } from '../event/getEvents';

export async function getRealtimeData(websites, time) {
  const [pageviews, sessions, events] = await Promise.all([
    getPageviews(websites, time),
    getSessions(websites, time),
    getEvents(websites, time),
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
