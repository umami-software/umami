import JSZip from 'jszip';
import Papa from 'papaparse';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { unauthorized } from '@/lib/response';
import { NextResponse } from 'next/server';
import { pagingParams, withDateRange } from '@/lib/schema';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getExportEventData, getExportSessionData, getExportWebsiteEvents } from '@/queries/sql';

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

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);

  const zip = new JSZip();

  // Prefix cells whose first character is a formula trigger with a single quote
  // to prevent CSV formula injection when opened in spreadsheet applications.
  const FORMULA_TRIGGERS = new Set(['=', '+', '-', '@', '\t', '\r']);

  const sanitizeCsvValue = (value: unknown): unknown => {
    if (typeof value === 'string' && value.length > 0 && FORMULA_TRIGGERS.has(value[0])) {
      return `'${value}`;
    }
    return value;
  };

  const sanitizeRow = (row: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      sanitized[key] = sanitizeCsvValue(value);
    }
    return sanitized;
  };

  const parse = (data: any, columns: string[]) => {
    const sanitized = Array.isArray(data) ? data.map(sanitizeRow) : data;
    return Papa.unparse(
      { fields: columns, data: sanitized },
      {
        header: true,
        skipEmptyLines: true,
      }
    );
  };

  const WEBSITE_EVENT_COLUMNS = [
    'website_id', 'session_id', 'visit_id', 'event_id', 'hostname', 'browser', 'os', 'device', 'screen', 'language', 'country', 'region', 'city', 'url_path', 'url_query', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer_path', 'referrer_query', 'referrer_domain', 'page_title', 'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid', 'lcp', 'inp', 'cls', 'fcp', 'ttfb', 'event_type', 'event_name', 'tag', 'distinct_id', 'created_at', 'job_id'
  ];
  const SESSION_DATA_COLUMNS = [
    'website_id', 'session_id', 'data_key', 'string_value', 'number_value', 'date_value', 'data_type', 'distinct_id', 'created_at', 'job_id'
  ];
  const EVENT_DATA_COLUMNS = [
    'website_id', 'session_id', 'event_id', 'url_path', 'event_name', 'data_key', 'string_value', 'number_value', 'date_value', 'data_type', 'created_at', 'job_id'
  ];

  zip.file('website_event.csv', parse(await getExportWebsiteEvents(websiteId, filters), WEBSITE_EVENT_COLUMNS));
  zip.file('session_data.csv', parse(await getExportSessionData(websiteId, filters), SESSION_DATA_COLUMNS));
  zip.file('event_data.csv', parse(await getExportEventData(websiteId, filters), EVENT_DATA_COLUMNS));

  const content = await zip.generateAsync({ type: 'arraybuffer' });

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="export.zip"`,
    },
  });
}
