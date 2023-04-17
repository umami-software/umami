import { md5 } from 'lib/crypto';
import { getSessions } from '../session/getSessions';
import { getEvents } from '../event/getEvents';
import { EVENT_TYPE } from 'lib/constants';

export async function getRealtimeData(websiteId, time) {
  const [pageviews, sessions, events] = await Promise.all([
    getEvents(websiteId, time, EVENT_TYPE.pageView),
    getSessions(websiteId, time),
    getEvents(websiteId, time, EVENT_TYPE.customEvent),
  ]);

  const decorate = (id, data) => {
    return data.map(props => ({
      ...props,
      __id: md5(id, ...Object.values(props)),
      __type: id,
      timestamp: props.timestamp ? props.timestamp * 1000 : new Date(props.createdAt).getTime(),
    }));
  };

  return {
    pageviews: decorate('pageview', pageviews),
    sessions: decorate('session', sessions),
    events: decorate('event', events),
    timestamp: Date.now(),
  };
}
