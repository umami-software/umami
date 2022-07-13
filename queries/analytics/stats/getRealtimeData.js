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
    pageviews: pageviews.map(({ view_id, ...props }) => ({
      __id: `p${view_id}`,
      view_id,
      ...props,
    })),
    sessions: sessions.map(({ session_id, ...props }) => ({
      __id: `s${session_id}`,
      session_id,
      ...props,
    })),
    events: events.map(({ event_id, ...props }) => ({
      __id: `e${event_id}`,
      event_id,
      ...props,
    })),
    timestamp: Date.now(),
  };
}
