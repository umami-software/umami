import { z } from 'zod';
import { toIso } from '../lib/dates';
import { MAX_SESSION_ACTIVITY } from '../lib/limits';
import { defineTool } from '../lib/tool';
import { formatSession, type SessionRow } from './sessions';

const HOUR = 60 * 60 * 1000;

interface ActivityRow {
  createdAt?: string | Date;
  urlPath?: string;
  urlQuery?: string | null;
  referrerDomain?: string | null;
  eventId?: string;
  eventType?: number;
  eventName?: string | null;
  visitId?: string;
  hasData?: number | boolean;
  [key: string]: unknown;
}

interface PropertyRow {
  dataKey?: string;
  dataType?: number;
  stringValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  [key: string]: unknown;
}

function propertyValue(row: PropertyRow) {
  if (row.stringValue !== undefined && row.stringValue !== null) {
    return row.stringValue;
  }

  if (row.numberValue !== undefined && row.numberValue !== null) {
    return row.numberValue;
  }

  return row.dateValue ?? null;
}

export const getSession = defineTool({
  name: 'get_session',
  title: 'Get session details',
  description:
    'Returns full details for one visitor session: visitor attributes, the ordered list of pageviews and events ' +
    'in the session (activity), and any custom session properties (e.g. plan, company). ' +
    'Use get_sessions first to find a sessionId. Requires the websiteId the session belongs to.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    sessionId: z.string().uuid().describe('Session ID from get_sessions or get_events.'),
    includeActivity: z
      .boolean()
      .optional()
      .describe(
        `Include the pageview/event timeline (default true, capped at ${MAX_SESSION_ACTIVITY} entries).`,
      ),
  }),
  async handler(input, { client }) {
    const session = (await client.getWebsiteSession({
      websiteId: input.websiteId,
      sessionId: input.sessionId,
    })) as unknown as SessionRow;

    const firstAt = Date.parse(String(session?.firstAt ?? '')) || Date.now() - 30 * 24 * HOUR;
    const lastAt = Date.parse(String(session?.lastAt ?? '')) || Date.now();
    const includeActivity = input.includeActivity ?? true;

    const [activity, properties] = await Promise.all([
      includeActivity
        ? (client.getWebsiteSessionActivity({
            websiteId: input.websiteId,
            sessionId: input.sessionId,
            startAt: firstAt - HOUR,
            endAt: lastAt + HOUR,
          }) as Promise<ActivityRow[]>)
        : Promise.resolve([] as ActivityRow[]),
      client.getWebsiteSessionProperties({
        websiteId: input.websiteId,
        sessionId: input.sessionId,
      }) as Promise<PropertyRow[]>,
    ]);

    const rows = Array.isArray(activity) ? activity : [];

    return {
      websiteId: input.websiteId,
      session: formatSession(session),
      properties: Object.fromEntries(
        (Array.isArray(properties) ? properties : [])
          .filter(row => row.dataKey)
          .map(row => [row.dataKey as string, propertyValue(row)]),
      ),
      activity: rows.slice(0, MAX_SESSION_ACTIVITY).map(row => ({
        at: toIso(row.createdAt as string),
        type: row.eventType === 2 ? 'event' : 'pageview',
        name: row.eventName ?? null,
        path: row.urlPath ?? null,
        query: row.urlQuery ?? null,
        referrer: row.referrerDomain ?? null,
        visitId: row.visitId ?? null,
        eventId: row.eventId ?? null,
      })),
      activityTruncated: rows.length > MAX_SESSION_ACTIVITY,
    };
  },
});
