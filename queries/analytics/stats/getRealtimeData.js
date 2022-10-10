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
    pageviews: pageviews.map(({ pageviewId, ...props }) => ({
      __id: `p${pageviewId}`,
      pageviewId,
      ...props,
    })),
    sessions: sessions.map(({ sessionId, ...props }) => ({
      __id: `s${sessionId}`,
      sessionId,
      ...props,
    })),
    events: events.map(({ eventId, ...props }) => ({
      __id: `e${eventId}`,
      eventId,
      ...props,
    })),
    timestamp: Date.now(),
  };
}
