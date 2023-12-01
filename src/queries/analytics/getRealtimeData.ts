import { md5 } from 'next-basics';
import { getSessions, getEvents } from 'queries/index';
import { EVENT_TYPE } from 'lib/constants';

export async function getRealtimeData(websiteId: string, startDate: Date) {
  const [pageviews, sessions, events] = await Promise.all([
    getEvents(websiteId, startDate, EVENT_TYPE.pageView),
    getSessions(websiteId, startDate),
    getEvents(websiteId, startDate, EVENT_TYPE.customEvent),
  ]);

  const decorate = (id: string, data: any[]) => {
    return data.map((props: { [key: string]: any }) => ({
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
