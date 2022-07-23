import { getPageviewMetrics, getSessionMetrics, getWebsiteById, getPageviewParams } from 'queries';
import { ok, methodNotAllowed, unauthorized, badRequest } from 'lib/response';
import { allowQuery } from 'lib/auth';
import { useCors } from 'lib/middleware';
import { FILTER_IGNORED } from 'lib/constants';

const sessionColumns = ['browser', 'os', 'device', 'screen', 'country', 'language'];
const pageviewColumns = ['url', 'referrer'];
const paramTypes = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];

function getTable(type) {
  if (type === 'event') {
    return 'event';
  }

  if (sessionColumns.includes(type)) {
    return 'session';
  }

  return 'pageview';
}

function getColumn(type) {
  if (type === 'event') {
    return `concat(event_type, '\t', event_value)`;
  }
  return type;
}

export default async (req, res) => {
  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, type, start_at, end_at, url, referrer, os, browser, device, country } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (paramTypes.includes(type)) {
      const column = 'url';
      const table = getTable(type);

      let domain;
      if (type === 'referrer') {
        const website = await getWebsiteById(websiteId);

        if (!website) {
          return badRequest(res);
        }

        domain = website.domain;
      }

      const filters = {
        domain,
        url: type !== 'url' && table !== 'event' ? url : undefined,
        referrer: type !== 'referrer' ? referrer : true,
        os: type !== 'os' ? os : undefined,
        browser: type !== 'browser' ? browser : undefined,
        device: type !== 'device' ? device : undefined,
        country: type !== 'country' ? country : undefined,
        event_url: type !== 'url' && table === 'event' ? url : undefined,
      };

      let data = await getPageviewParams(
        type,
        websiteId,
        startDate,
        endDate,
        column,
        table,
        filters,
      );

      let terms = {};
      new Set(data.map(i => i.param)).forEach(term => (terms[term] = null));
      for (let { param } of data) terms[param] += 1;

      return ok(
        res,
        Object.keys(terms).map(i => ({ x: i, y: terms[i] })),
      );
    }

    if (sessionColumns.includes(type)) {
      let data = await getSessionMetrics(websiteId, startDate, endDate, type, {
        os,
        browser,
        device,
        country,
      });

      if (type === 'language') {
        let combined = {};

        for (let { x, y } of data) {
          x = String(x).toLowerCase().split('-')[0];

          if (!combined[x]) {
            combined[x] = { x, y };
          } else {
            combined[x].y += y;
          }
        }

        data = Object.values(combined);
      }

      return ok(res, data);
    }

    if (pageviewColumns.includes(type) || type === 'event') {
      let domain;
      if (type === 'referrer') {
        const website = await getWebsiteById(websiteId);

        if (!website) {
          return badRequest(res);
        }

        domain = website.domain;
      }

      const column = getColumn(type);
      const table = getTable(type);
      const filters = {
        domain,
        url: type !== 'url' && table !== 'event' ? url : undefined,
        referrer: type !== 'referrer' && table !== 'event' ? referrer : FILTER_IGNORED,
        os: type !== 'os' ? os : undefined,
        browser: type !== 'browser' ? browser : undefined,
        device: type !== 'device' ? device : undefined,
        country: type !== 'country' ? country : undefined,
        event_url: type !== 'url' && table === 'event' ? url : undefined,
      };

      const data = await getPageviewMetrics(websiteId, startDate, endDate, column, table, filters);

      return ok(res, data);
    }
  }

  return methodNotAllowed(res);
};
