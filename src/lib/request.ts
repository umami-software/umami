import { checkAuth } from '@/lib/auth';
import { DEFAULT_PAGE_SIZE, FILTER_COLUMNS } from '@/lib/constants';
import { getAllowedUnits, getMinimumUnit, maxDate, parseDateRange } from '@/lib/date';
import { fetchWebsite } from '@/lib/load';
import { badRequest, unauthorized } from '@/lib/response';
import { QueryFilters } from '@/lib/types';
import { getWebsiteSegment } from '@/queries';
import { z } from 'zod/v4';

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
  const dateRange = getRequestDateRange(params);
  const filters = getRequestFilters(params);

  if (websiteId) {
    await setWebsiteDate(websiteId, dateRange);

    if (params.segment) {
      Object.assign(filters, (await getWebsiteSegment(websiteId, params.segment))?.parameters);
    }

    if (params.cohort) {
      const cohortFilters = (await getWebsiteSegment(websiteId, params.cohort))
        ?.parameters as Record<string, any>;

      // convert dateRange to startDate and endDate
      if (cohortFilters.dateRange) {
        const { startDate, endDate } = parseDateRange(cohortFilters.dateRange);
        cohortFilters.startDate = startDate;
        cohortFilters.endDate = endDate;
        delete cohortFilters.dateRange;
      }

      Object.assign(
        filters,
        Object.fromEntries(
          Object.entries(cohortFilters || {}).map(([key, value]) =>
            key === 'startDate' || key === 'endDate'
              ? [`cohort_${key}`, new Date(value)]
              : [`cohort_${key}`, value],
          ),
        ),
      );
    }
  }

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
