import { getSessions, getEvents, getPageviewStats, getSessionStats } from 'queries/index';

const MAX_SIZE = 50;

function increment(data: object, key: string) {
  if (key) {
    if (!data[key]) {
      data[key] = 1;
    } else {
      data[key] += 1;
    }
  }
}

export async function getRealtimeData(
  websiteId: string,
  criteria: { startDate: Date; timezone: string },
) {
  const { startDate, timezone } = criteria;
  const filters = { startDate, endDate: new Date(), unit: 'minute', timezone };
  const [events, sessions, pageviews, sessionviews] = await Promise.all([
    getEvents(websiteId, { startDate }),
    getSessions(websiteId, { startDate }),
    getPageviewStats(websiteId, filters),
    getSessionStats(websiteId, filters),
  ]);

  const uniques = new Set();

  const sessionStats = sessions.reduce(
    (obj: { visitors: any; countries: any }, session: { id: any; country: any }) => {
      const { countries, visitors } = obj;
      const { id, country } = session;

      if (!uniques.has(id)) {
        uniques.add(id);
        increment(countries, country);

        if (visitors.length < MAX_SIZE) {
          visitors.push(session);
        }
      }

      return obj;
    },
    {
      countries: {},
      visitors: [],
    },
  );

  const eventStats = events.reduce(
    (
      obj: { urls: any; referrers: any; events: any },
      event: { urlPath: any; referrerDomain: any },
    ) => {
      const { urls, referrers, events } = obj;
      const { urlPath, referrerDomain } = event;

      increment(urls, urlPath);
      increment(referrers, referrerDomain);

      if (events.length < MAX_SIZE) {
        events.push(event);
      }

      return obj;
    },
    {
      urls: {},
      referrers: {},
      events: [],
    },
  );

  return {
    ...sessionStats,
    ...eventStats,
    series: {
      views: pageviews,
      visitors: sessionviews,
    },
    totals: {
      views: events.filter(e => !e.eventName).length,
      visitors: uniques.size,
      events: events.filter(e => e.eventName).length,
      countries: Object.keys(sessionStats.countries).length,
    },
    timestamp: Date.now(),
  };
}
