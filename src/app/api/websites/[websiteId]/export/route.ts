import { z } from 'zod';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { getRequestFilters, parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { pagingParams } from '@/lib/schema';
import { getEventMetrics, getPageviewMetrics, getSessionMetrics } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { startAt, endAt } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  const filters = {
    ...(await getRequestFilters(query)),
    startDate,
    endDate,
  };

  const [events, pages, referrers, browsers, os, devices, countries] = await Promise.all([
    getEventMetrics(websiteId, 'event', filters),
    getPageviewMetrics(websiteId, 'url', filters),
    getPageviewMetrics(websiteId, 'referrer', filters),
    getSessionMetrics(websiteId, 'browser', filters),
    getSessionMetrics(websiteId, 'os', filters),
    getSessionMetrics(websiteId, 'device', filters),
    getSessionMetrics(websiteId, 'country', filters),
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
