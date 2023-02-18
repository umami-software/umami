import { md5 } from 'lib/crypto';
import { getPageviews } from '../pageview/getPageviews';
import { getSessions } from '../session/getSessions';
import { getEvents } from '../event/getEvents';

export async function getRealtimeData(websiteId, time) {
  const [pageviews, sessions, events] = await Promise.all([
    getPageviews(websiteId, time),
    getSessions(websiteId, time),
    getEvents(websiteId, time),
  ]);

  const decorate = (id, data) => {
    return data.map(props => ({
      ...props,
      __id: md5(id, ...Object.values(props)),
      timestamp: props.timestamp * 1000,
      timestampCompare: new Date(props.createdAt).getTime(),
    }));
  };

  return {
    pageviews: decorate('pageviews', pageviews),
    sessions: decorate('sessions', sessions),
    events: decorate('events', events),
    timestamp: Date.now(),
  };
}
