import { z } from 'zod/v4';
import { FILTER_COLUMNS, DEFAULT_PAGE_SIZE, FILTER_GROUPS } from '@/lib/constants';
import { badRequest, unauthorized } from '@/lib/response';
import { getAllowedUnits, getMinimumUnit, maxDate } from '@/lib/date';
import { checkAuth } from '@/lib/auth';
import { fetchWebsite } from '@/lib/load';
import { QueryFilters } from '@/lib/types';
import { getWebsiteSegment } from '@/queries';

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
  const result: Record<string, any> = {};

  for (const key of Object.keys(FILTER_COLUMNS)) {
    const value = query[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

export async function getRequestSegments(websiteId: string, query: Record<string, any>) {
  for (const key of Object.keys(FILTER_GROUPS)) {
    const value = query[key];

    if (value !== undefined) {
      return getWebsiteSegment(websiteId, key, value);
    }
  }
}

export async function setWebsiteDate(websiteId: string, data: Record<string, any>) {
  const website = await fetchWebsite(websiteId);

  if (website) {
    data.startDate = maxDate(data.startDate, new Date(website?.resetAt));
  }

  return data;
}

export async function getQueryFilters(
  params: Record<string, any>,
  websiteId?: string,
): Promise<QueryFilters> {
  const dateRange = await setWebsiteDate(websiteId, getRequestDateRange(params));
  const filters = getRequestFilters(params);
  const segments = await getRequestSegments(websiteId, params);

  return {
    ...dateRange,
    ...filters,
    ...segments,
    page: params?.page,
    pageSize: params?.page ? params?.pageSize || DEFAULT_PAGE_SIZE : undefined,
    orderBy: params?.orderBy,
    sortDescending: params?.sortDescending,
    search: params?.search,
  };
}
