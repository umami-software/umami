import { ZodObject } from 'zod';
import { getAllowedUnits, getMinimumUnit } from './date';
import { getWebsiteDateRange } from '../queries';
import { FILTER_COLUMNS } from 'lib/constants';

export async function getJsonBody(request: Request) {
  try {
    return await request.clone().json();
  } catch {
    return null;
  }
}

export async function checkRequest(request: Request, schema: ZodObject<any>) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const body = await getJsonBody(request);

  const result = schema.safeParse(request.method === 'GET' ? query : body);

  return { query, body, error: result.error };
}

export async function getRequestDateRange(query: Record<string, any>) {
  const { websiteId, startAt, endAt, unit } = query;

  // All-time
  if (+startAt === 0 && +endAt === 1) {
    const result = await getWebsiteDateRange(websiteId as string);
    const { min, max } = result[0];
    const startDate = new Date(min);
    const endDate = new Date(max);

    return {
      startDate,
      endDate,
      unit: getMinimumUnit(startDate, endDate),
    };
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);
  const minUnit = getMinimumUnit(startDate, endDate);

  return {
    startDate,
    endDate,
    unit: (getAllowedUnits(startDate, endDate).includes(unit as string) ? unit : minUnit) as string,
  };
}

export function getRequestFilters(query: Record<string, any>) {
  return Object.keys(FILTER_COLUMNS).reduce((obj, key) => {
    const value = query[key];

    if (value !== undefined) {
      obj[key] = value;
    }

    return obj;
  }, {});
}
