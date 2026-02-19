import JSZip from 'jszip';
import Papa from 'papaparse';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, withDateRange } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getEventMetrics, getPageviewMetrics, getSessionMetrics } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const [events, pages, referrers, browsers, os, devices, countries] = await Promise.all([
    getEventMetrics(websiteId, { type: 'event' }, filters),
    getPageviewMetrics(websiteId, { type: 'path' }, filters),
    getPageviewMetrics(websiteId, { type: 'referrer' }, filters),
    getSessionMetrics(websiteId, { type: 'browser' }, filters).then(r => r.data),
    getSessionMetrics(websiteId, { type: 'os' }, filters).then(r => r.data),
    getSessionMetrics(websiteId, { type: 'device' }, filters).then(r => r.data),
    getSessionMetrics(websiteId, { type: 'country' }, filters).then(r => r.data),
  ]);

  const zip = new JSZip();

  const parse = (data: any) => {
    return Papa.unparse(data, {
      header: true,
      skipEmptyLines: true,
    });
  };

  zip.file('events.csv', parse(events));
  zip.file('pages.csv', parse(pages));
  zip.file('referrers.csv', parse(referrers));
  zip.file('browsers.csv', parse(browsers));
  zip.file('os.csv', parse(os));
  zip.file('devices.csv', parse(devices));
  zip.file('countries.csv', parse(countries));

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  const base64 = content.toString('base64');

  return json({ zip: base64 });
}
