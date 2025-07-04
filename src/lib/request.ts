import { z } from 'zod/v4';
import { FILTER_COLUMNS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { badRequest, unauthorized } from '@/lib/response';
import { getAllowedUnits, getMinimumUnit, maxDate } from '@/lib/date';
import { checkAuth } from '@/lib/auth';
import { fetchWebsite } from '@/lib/load';
import { QueryFilters } from '@/lib/types';

export async function parseRequest(
  request: Request,
  schema?: any,
  options?: { skipAuth: boolean },
): Promise<any> {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  let body = await getJsonBody(request);
  let error: () => void | undefined;
  let auth = null;

  if (schema) {
    const isGet = request.method === 'GET';
    const result = schema.safeParse(isGet ? query : body);

    if (!result.success) {
      error = () => badRequest(z.treeifyError(result.error));
    } else if (isGet) {
      query = result.data;
    } else {
      body = result.data;
    }
  }

  if (!options?.skipAuth && !error) {
    auth = await checkAuth(request);

    if (!auth) {
      error = () => unauthorized();
    }
  }

  return { url, query, body, auth, error };
}

export async function getJsonBody(request: Request) {
  try {
    return await request.clone().json();
  } catch {
    return undefined;
  }
}

export function getRequestDateRange(query: Record<string, string>) {
  const { startAt, endAt, unit, timezone } = query;

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  return {
    startDate,
    endDate,
    timezone,
    unit: getAllowedUnits(startDate, endDate).includes(unit)
      ? unit
      : getMinimumUnit(startDate, endDate),
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

export async function setWebsiteDate(websiteId: string, data: Record<string, any>) {
  const website = await fetchWebsite(websiteId);

  if (website) {
    data.startDate = maxDate(data.startDate, new Date(website?.resetAt));
  }

  return data;
}

export function getQueryFilters(params: Record<string, any>): QueryFilters {
  const dateRange = getRequestDateRange(params);
  const filters = getRequestFilters(params);

  return {
    ...dateRange,
    ...filters,
    page: params?.page,
    pageSize: params?.page ? params?.pageSize || DEFAULT_PAGE_SIZE : undefined,
    orderBy: params?.orderBy,
    sortDescending: params?.sortDescending,
    search: params?.search,
  };
}
