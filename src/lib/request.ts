import { startOfMonth, subMonths } from 'date-fns';
import { z } from 'zod';
import { checkAuth } from '@/lib/auth';
import { DEFAULT_PAGE_SIZE, FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import {
  getAllowedUnits,
  getMinimumUnit,
  getPeriodDateRange,
  maxDate,
  parseDateRange,
} from '@/lib/date';
import { fetchAccount, fetchWebsite } from '@/lib/load';
import {
  filtersArrayToObject,
  parseSessionPropertyFilters,
  parseUniversalEventPropertyFilters,
} from '@/lib/params';
import { badRequest, forbidden, unauthorized } from '@/lib/response';
import type { Auth, Filter, Operator, QueryFilters, SessionPropertyFilter } from '@/lib/types';
import { getShareParametersForWebsite } from '@/permissions';
import { getWebsiteSegment } from '@/queries/prisma';

export async function parseRequest(
  request: Request,
  schema?: any,
  options?: { skipAuth?: boolean; allowTwoFactorSetup?: boolean },
): Promise<any> {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  let body = await getJsonBody(request);
  let error: () => undefined | undefined | Response;
  let auth = null;

  if (schema) {
    const isGet = request.method === 'GET';
    const rawQuery = query;
    const result = schema.safeParse(isGet ? query : body);

    if (!result.success) {
      error = () => badRequest(z.treeifyError(result.error));
    } else if (isGet) {
      query = result.data;

      // Re-add dynamic params stripped by Zod schema: suffixed filter params (browser1, os2)
      for (const key of Object.keys(rawQuery)) {
        if (
          (/\d+$/.test(key) || /^pf_/.test(key) || /^epf\d+$/.test(key) || /^spf\d+$/.test(key)) &&
          !(key in query)
        ) {
          query[key] = rawQuery[key];
        }
      }
    } else {
      body = result.data;
    }
  }

  if (!options?.skipAuth && !error) {
    auth = await checkAuth(request);

    if (!auth) {
      error = () => unauthorized();
    } else if (auth.twoFactorSetupPending && !options?.allowTwoFactorSetup) {
      // Users who must enroll in 2FA can only reach the routes needed to complete setup.
      error = () =>
        forbidden({
          code: 'two-factor-error-setup-required',
          message: 'Two-factor authentication setup is required',
        });
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

export function resolvePeriodDateRange(params: Record<string, any>, now = new Date()) {
  if (!params.period) {
    return params;
  }

  const { startDate, endDate } = getPeriodDateRange(params.period, params.timezone || 'UTC', now);

  return {
    ...params,
    startAt: +startDate,
    endAt: +endDate,
    timezone: params.timezone || 'UTC',
  };
}

export function getRequestFilters(query: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const key of Object.keys(query)) {
    const baseName = key.replace(/\d+$/, '');
    if (baseName in FILTER_COLUMNS) {
      result[key] = query[key];
    }
  }

  return result;
}

export async function setWebsiteDate(websiteId: string, data: Record<string, any>) {
  const website = await fetchWebsite(websiteId);
  const cloudMode = !!process.env.CLOUD_MODE;

  if (cloudMode && website && !website.teamId) {
    const account = await fetchAccount(website.userId);

    if (!account?.hasSubscription) {
      data.startDate = maxDate(data.startDate, startOfMonth(subMonths(new Date(), 6)));
    }
  }

  if (website?.resetAt) {
    data.startDate = maxDate(data.startDate, new Date(website?.resetAt));
  }

  return data;
}

const STRIPPED_FILTER_KEYS = new Set(['segment', 'cohort', 'excludeBounce', 'match']);

function stripClientFilterParams(params: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    const baseName = key.replace(/\d+$/, '');
    if (
      baseName in FILTER_COLUMNS ||
      STRIPPED_FILTER_KEYS.has(key) ||
      /^epf\d+$/.test(key) ||
      /^spf\d+$/.test(key) ||
      /^pf_/.test(key)
    ) {
      continue;
    }
    result[key] = value;
  }

  return result;
}

function mergeFiltersWithoutCollision(
  target: Record<string, any>,
  filtersList: Array<{ name: string; operator: Operator; value: string | string[] }> | undefined,
) {
  if (!filtersList?.length) {
    return;
  }

  // Stored filter names are free-form, so keep only real filter columns. Otherwise a filter
  // named e.g. "timezone" would replace the validated request value on its way into SQL.
  const safeObj = getRequestFilters(filtersArrayToObject(filtersList as Filter[]));

  for (const [key, value] of Object.entries(safeObj)) {
    const baseName = key.replace(/\d+$/, '');
    let destKey = baseName;
    let idx = 1;

    while (destKey in target) {
      destKey = `${baseName}${idx}`;
      idx++;
    }

    target[destKey] = value;
  }
}

export async function getQueryFilters(
  params: Record<string, any>,
  websiteId?: string,
  auth?: Auth | null,
): Promise<QueryFilters> {
  const shareParams = await getShareParametersForWebsite(auth, websiteId);

  const clientParams =
    shareParams?.allowFilter === false ? stripClientFilterParams(params) : params;

  const resolvedParams = resolvePeriodDateRange(clientParams);
  const dateRange = getRequestDateRange(resolvedParams);
  const filters = getRequestFilters(resolvedParams);
  const eventPropertyFilters = parseUniversalEventPropertyFilters(resolvedParams);
  const sessionPropertyFilters = parseSessionPropertyFilters(resolvedParams);

  let match = resolvedParams?.match;

  if (websiteId) {
    await setWebsiteDate(websiteId, dateRange);

    if (resolvedParams.segment && resolvedParams.segment !== shareParams?.segment) {
      const segmentParams = (await getWebsiteSegment(websiteId, resolvedParams.segment))
        ?.parameters as Record<string, any>;

      // Stored filter names are free-form, so keep only real filter columns. Otherwise a filter
      // named e.g. "timezone" would replace the validated request value on its way into SQL.
      Object.assign(filters, getRequestFilters(filtersArrayToObject(segmentParams.filters)));
      sessionPropertyFilters.push(...(segmentParams.sessionPropertyFilters ?? []));

      if (segmentParams.match) {
        match = segmentParams.match;
      }
    }

    if (resolvedParams.cohort) {
      const cohortParams = (await getWebsiteSegment(websiteId, resolvedParams.cohort))
        ?.parameters as Record<string, any>;

      const { startDate, endDate } = parseDateRange(cohortParams.dateRange);

      const cohortFilters = (cohortParams.filters ?? []).map(({ name, ...props }) => ({
        ...props,
        name: `cohort_${name}`,
      }));

      if (!['path', 'event'].includes(cohortParams.action.type)) {
        throw new Error('This cohort uses a retired action and must be updated.');
      }
      cohortFilters.push({
        name: `cohort_${cohortParams.action.type}`,
        operator: OPERATORS.equals,
        value: cohortParams.action.value,
      });

      Object.assign(filters, {
        ...filtersArrayToObject(cohortFilters),
        cohort_startDate: startDate,
        cohort_endDate: endDate,
        ...(cohortParams.match && {
          cohort_match: cohortParams.match,
          cohort_actionName: `cohort_${cohortParams.action.type}`,
        }),
      });
    }

    if (resolvedParams.excludeBounce) {
      Object.assign(filters, { excludeBounce: true });
    }
  }

  const lockedFilterMap: Record<string, any> = {};
  const lockedSessionPropertyFilters: SessionPropertyFilter[] = [];
  let lockedMatch: 'all' | 'any' | undefined;

  if (shareParams) {
    mergeFiltersWithoutCollision(lockedFilterMap, shareParams.filters);

    if (shareParams.match) {
      lockedMatch = shareParams.match;
    }

    if (shareParams.segment && websiteId) {
      const segment = await getWebsiteSegment(websiteId, shareParams.segment);

      if (!segment) {
        throw new Error('Share segment not found.');
      }

      const segmentParams = segment.parameters as Record<string, any>;

      mergeFiltersWithoutCollision(lockedFilterMap, segmentParams.filters);
      lockedSessionPropertyFilters.push(...(segmentParams.sessionPropertyFilters ?? []));

      if (segmentParams.match) {
        lockedMatch = segmentParams.match;
      }
    }
  }

  const hasLockedFilters =
    Object.keys(lockedFilterMap).length > 0 || lockedSessionPropertyFilters.length > 0;

  return {
    ...dateRange,
    ...filters,
    match,
    minDuration: resolvedParams?.minDuration,
    eventPropertyFilters,
    sessionPropertyFilters,
    ...(hasLockedFilters && {
      lockedFilters: {
        filters: lockedFilterMap,
        ...(lockedMatch && { match: lockedMatch }),
        ...(lockedSessionPropertyFilters.length > 0 && {
          sessionPropertyFilters: lockedSessionPropertyFilters,
        }),
      },
    }),
    page: resolvedParams?.page,
    pageSize: resolvedParams?.pageSize ? resolvedParams?.pageSize || DEFAULT_PAGE_SIZE : undefined,
    orderBy: resolvedParams?.orderBy,
    sortDescending: resolvedParams?.sortDescending,
    search: resolvedParams?.search,
    compare: resolvedParams?.compare,
    maxResults: resolvedParams?.maxResults,
  };
}
