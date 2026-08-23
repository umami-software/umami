import JSZip from 'jszip';
import Papa from 'papaparse';
import { Readable } from 'stream';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { unauthorized } from '@/lib/response';
import { NextResponse } from 'next/server';
import { pagingParams, withDateRange } from '@/lib/schema';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getExportEventData, getExportSessionData, getExportWebsiteEvents, getExportEventDataClickhouseStream, getExportSessionDataClickhouseStream, getExportWebsiteEventsClickhouseStream } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const shareToken = url.searchParams.get('shareToken');

  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: new Headers(request.headers),
  });

  if (token) modifiedRequest.headers.set('authorization', `Bearer ${token}`);
  if (shareToken) {
    modifiedRequest.headers.set('x-umami-share-token', shareToken);
    modifiedRequest.headers.set('x-umami-share-context', '1');
  }

  const schema = withDateRange({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(modifiedRequest, schema);

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

  const isClickhouse = !!process.env.CLICKHOUSE_URL;

  function createCsvStream(fetcher: any, clickhouseFetcher: any, columns: string[]) {
    async function* generate() {
      let isHeaderWritten = false;

      if (isClickhouse) {
        const stream = await clickhouseFetcher(websiteId, filters);
        for await (const rows of stream) {
          const data = rows.map((r: any) => r.json());
          if (data.length === 0) continue;
          
          const sanitized = data.map(sanitizeRow);
          const csv = Papa.unparse(
            { fields: columns, data: sanitized },
            { header: !isHeaderWritten, skipEmptyLines: true }
          );
          isHeaderWritten = true;
          yield csv + '\n';
        }
      } else {
        let cursorDate: Date | undefined = undefined;
        let cursorId: string | undefined = undefined;

        while (true) {
          const data = await fetcher(websiteId, { ...filters, cursorDate, cursorId });
          
          if (data.length === 0) {
            if (!isHeaderWritten) {
              yield Papa.unparse({ fields: columns, data: [] }, { header: true }) + '\n';
            }
            break;
          }

          const sanitized = data.map(sanitizeRow);
          const csv = Papa.unparse(
            { fields: columns, data: sanitized },
            { header: !isHeaderWritten, skipEmptyLines: true }
          );
          isHeaderWritten = true;
          yield csv + '\n';

          if (data.length < 10000) {
            break;
          }

          const lastRow = data[data.length - 1];
          cursorDate = lastRow.created_at;
          cursorId = lastRow.id || lastRow.event_id;
        }
      }
    }

    return Readable.from(generate());
  }

  const WEBSITE_EVENT_COLUMNS = [
    'website_id', 'session_id', 'visit_id', 'event_id', 'hostname', 'browser', 'os', 'device', 'screen', 'language', 'country', 'region', 'city', 'url_path', 'url_query', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer_path', 'referrer_query', 'referrer_domain', 'page_title', 'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid', 'lcp', 'inp', 'cls', 'fcp', 'ttfb', 'event_type', 'event_name', 'tag', 'distinct_id', 'created_at', 'job_id'
  ];
  const SESSION_DATA_COLUMNS = [
    'website_id', 'session_id', 'data_key', 'string_value', 'number_value', 'date_value', 'data_type', 'distinct_id', 'created_at', 'job_id'
  ];
  const EVENT_DATA_COLUMNS = [
    'website_id', 'session_id', 'event_id', 'url_path', 'event_name', 'data_key', 'string_value', 'number_value', 'date_value', 'data_type', 'created_at', 'job_id'
  ];

  zip.file('website_event.csv', createCsvStream(getExportWebsiteEvents, getExportWebsiteEventsClickhouseStream, WEBSITE_EVENT_COLUMNS));
  zip.file('session_data.csv', createCsvStream(getExportSessionData, getExportSessionDataClickhouseStream, SESSION_DATA_COLUMNS));
  zip.file('event_data.csv', createCsvStream(getExportEventData, getExportEventDataClickhouseStream, EVENT_DATA_COLUMNS));

  const nodeStream = zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true });
  const webStream = Readable.toWeb(nodeStream as any);

  return new NextResponse(webStream as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="export.zip"`,
    },
  });
}
