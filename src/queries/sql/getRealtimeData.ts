import { getPageviewStats, getRealtimeActivity, getSessionStats } from '@/queries';

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
  const [activity, pageviews, sessions] = await Promise.all([
    getRealtimeActivity(websiteId, filters),
    getPageviewStats(websiteId, filters),
    getSessionStats(websiteId, filters),
  ]);

  const uniques = new Set();

  const { countries, urls, referrers, events } = activity.reverse().reduce(
    (
      obj: { countries: any; urls: any; referrers: any; events: any },
      event: {
        sessionId: string;
        urlPath: string;
        referrerDomain: string;
        country: string;
        eventName: string;
      },
    ) => {
      const { countries, urls, referrers, events } = obj;
      const { sessionId, urlPath, referrerDomain, country, eventName } = event;

      if (!uniques.has(sessionId)) {
        uniques.add(sessionId);
        increment(countries, country);

        events.push({ __type: 'session', ...event });
      }

      increment(urls, urlPath);
      increment(referrers, referrerDomain);

      events.push({ __type: eventName ? 'event' : 'pageview', ...event });

      return obj;
    },
    {
      countries: {},
      urls: {},
      referrers: {},
      events: [],
    },
  );

  return {
    countries,
    urls,
    referrers,
    events: events.reverse(),
    series: {
      views: pageviews,
      visitors: sessions,
    },
    totals: {
      views: pageviews.reduce((sum: number, { y }: { y: number }) => Number(sum) + Number(y), 0),
      visitors: sessions.reduce((sum: number, { y }: { y: number }) => Number(sum) + Number(y), 0),
      events: activity.filter(e => e.eventName).length,
      countries: Object.keys(countries).length,
    },
    timestamp: Date.now(),
  };
}
