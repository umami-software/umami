import { canViewWebsite } from '@/permissions';
import { badRequest, json, methodNotAllowed, unauthorized } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getDateRangeValues, parseDateRange } from '@/lib/date';
import {
  getEvents,
  getPageviews,
  getReferrers,
  getBrowsers,
  getOS,
  getDevices,
  getCountries,
  getRegions,
  getCities,
} from '@/queries/sql';

export async function GET(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {
  const { auth, query, error } = await parseRequest(request, {
    type: z.enum(['events', 'pageviews', 'referrers', 'browsers', 'os', 'devices', 'countries', 'regions', 'cities']),
    ...dateRangeParams,
    ...filterParams,
  });

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { type } = query;
  const { startDate, endDate } = parseDateRange(query);

  const filters = await getQueryFilters(query, websiteId);

  switch (type) {
    case 'events':
      return json(await getEvents(websiteId, { startDate, endDate }, filters));
    case 'pageviews':
      return json(await getPageviews(websiteId, { startDate, endDate }, filters));
    case 'referrers':
      return json(await getReferrers(websiteId, { startDate, endDate }, filters));
    case 'browsers':
      return json(await getBrowsers(websiteId, { startDate, endDate }, filters));
    case 'os':
      return json(await getOS(websiteId, { startDate, endDate }, filters));
    case 'devices':
      return json(await getDevices(websiteId, { startDate, endDate }, filters));
    case 'countries':
      return json(await getCountries(websiteId, { startDate, endDate }, filters));
    case 'regions':
      return json(await getRegions(websiteId, { startDate, endDate }, filters));
    case 'cities':
      return json(await getCities(websiteId, { startDate, endDate }, filters));
    default:
      return badRequest('Invalid type');
  }
}

// Add the export function
export async function POST(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {
  const { auth, query, error } = await parseRequest(request, {
    ...dateRangeParams,
    ...filterParams,
  });

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = parseDateRange(query);
  const filters = await getQueryFilters(query, websiteId);

  const [events, pages, referrers, browsers, os, devices, countries, regions, cities] =
    await Promise.all([
      getEvents(websiteId, { startDate, endDate }, filters),
      getPageviews(websiteId, { startDate, endDate }, filters),
      getReferrers(websiteId, { startDate, endDate }, filters),
      getBrowsers(websiteId, { startDate, endDate }, filters),
      getOS(websiteId, { startDate, endDate }, filters),
      getDevices(websiteId, { startDate, endDate }, filters),
      getCountries(websiteId, { startDate, endDate }, filters),
      getRegions(websiteId, { startDate, endDate }, filters),
      getCities(websiteId, { startDate, endDate }, filters),
    ]);

  // Check if all datasets are empty
  const hasData = [
    events,
    pages,
    referrers,
    browsers,
    os,
    devices,
    countries,
    regions,
    cities
  ].some(dataset => dataset && dataset.length > 0);

  if (!hasData) {
    return json({ error: 'no_data' });
  }

  return json({
    events,
    pages,
    referrers,
    browsers,
    os,
    devices,
    countries,
    regions,
    cities,
  });
}