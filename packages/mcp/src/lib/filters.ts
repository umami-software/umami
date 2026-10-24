import { z } from 'zod';
import { McpToolError } from './errors';

const filterValue = z
  .string()
  .min(1)
  .describe(
    'Exact match by default. Prefix with an operator: "neq.value", "c.value" (contains), "dnc.value", "re.regex", "nre.regex". Comma-separate multiple values: "chrome,firefox".',
  );

/** Example shapes agents can copy (also valid as top-level tool arguments). */
export const FILTER_EXAMPLES = {
  browserAndCountry: { browser: 'chrome', country: 'US' },
  pagePath: { path: '/pricing' },
  segment: { segment: 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2' },
  customEvent: { event: 'signup' },
} as const;

const filterFieldDescriptions = {
  path: 'Page path, e.g. "/pricing".',
  referrer: 'Referrer domain, e.g. "google.com".',
  title: 'Page title.',
  query: 'URL query string.',
  hostname: 'Hostname the page was served from.',
  event: 'Custom event name (event tools and event-type metrics only).',
  tag: 'Tracker tag.',
  browser: 'Browser name, e.g. "chrome".',
  os: 'Operating system, e.g. "Mac OS".',
  device: 'Device type: desktop, laptop, tablet or mobile.',
  country: 'ISO 3166-1 alpha-2 country code, e.g. "US".',
  region: 'Region code, e.g. "US-CA".',
  city: 'City name.',
  language: 'Browser language, e.g. "en-US".',
  distinctId: 'Identified user ID (distinct ID).',
  utmSource: 'UTM source.',
  utmMedium: 'UTM medium.',
  utmCampaign: 'UTM campaign.',
  utmContent: 'UTM content.',
  utmTerm: 'UTM term.',
  segment: 'Saved segment ID (see list_segments).',
  cohort: 'Saved cohort ID (see list_segments).',
  match: 'Whether all set filters must match ("all", default) or any may match ("any").',
} as const;

export type FilterKey = keyof typeof filterFieldDescriptions;

type FilterFieldSchema<K extends FilterKey> = K extends 'segment' | 'cohort'
  ? z.ZodOptional<z.ZodString>
  : K extends 'match'
    ? z.ZodOptional<z.ZodEnum<{ all: 'all'; any: 'any' }>>
    : z.ZodOptional<z.ZodString>;

function optionalFilterField<K extends FilterKey>(key: K): FilterFieldSchema<K> {
  if (key === 'segment' || key === 'cohort') {
    return z.string().uuid().optional().describe(filterFieldDescriptions[key]) as FilterFieldSchema<K>;
  }

  if (key === 'match') {
    return z
      .enum(['all', 'any'])
      .optional()
      .describe(filterFieldDescriptions[key]) as FilterFieldSchema<K>;
  }

  return filterValue.optional().describe(filterFieldDescriptions[key]) as FilterFieldSchema<K>;
}

const allFilterKeys = Object.keys(filterFieldDescriptions) as FilterKey[];

export type PageviewFilterKey = Exclude<FilterKey, 'event'>;

const pageviewFilterKeys = allFilterKeys.filter(
  (key): key is PageviewFilterKey => key !== 'event',
);

type FilterFieldsFor<Keys extends FilterKey> = {
  [K in Keys]: FilterFieldSchema<K>;
};

function buildFilterFields<const Keys extends FilterKey>(
  keys: readonly Keys[],
): FilterFieldsFor<Keys> {
  const shape = {} as FilterFieldsFor<Keys>;

  for (const key of keys) {
    shape[key] = optionalFilterField(key);
  }

  return shape;
}

/** Optional filter arguments at the top level of a tool (no nested "filters" object). */
export const pageviewFilterFields = buildFilterFields(pageviewFilterKeys);

/**
 * Pageview tools accept but reject `event` so agents get a clear error instead of a stripped argument.
 */
export const pageviewEventGuardField = {
  event: filterValue
    .optional()
    .describe(
      'Not supported on pageview or performance tools. Use get_event_stats, get_event_series, or get_website_metrics with type "event".',
    ),
};

/** Same as pageview filters plus `event` for event-scoped analytics tools. */
export const eventFilterFields = buildFilterFields(allFilterKeys);

export type Filters = {
  [K in FilterKey]?: K extends 'match' ? 'all' | 'any' : string;
};

export const filtersSchema = z.object(buildFilterFields(allFilterKeys)).strict();

// Pageview and performance queries never match a custom event name (#3886),
// so their tools reject the event filter instead of returning zeros.
export const pageviewFiltersSchema = filtersSchema.omit({ event: true });

const FILTER_KEY_SET = new Set<string>(allFilterKeys);

export const REMOVED_FILTERS_MESSAGE =
  'The "filters" object was removed. Pass filter keys at the top level, e.g. { "country": "US" }.';

/** Catches legacy nested `filters` so validation does not strip it before the handler runs. */
export const removedFiltersGuardField = {
  filters: z
    .unknown()
    .optional()
    .describe('Removed. Pass filter keys (browser, country, path, …) at the top level instead.'),
};

export function assertNoRemovedFilters(input: { filters?: unknown }) {
  if (input.filters !== undefined && input.filters !== null) {
    throw new McpToolError('invalid_input', REMOVED_FILTERS_MESSAGE);
  }
}

export const pageviewFilterToolFields = {
  ...pageviewFilterFields,
  ...pageviewEventGuardField,
  ...removedFiltersGuardField,
};

/** Pageview filter tools that define their own top-level `event` parameter (e.g. get_events). */
export const pageviewFilterToolFieldsWithoutEventGuard = {
  ...pageviewFilterFields,
  ...removedFiltersGuardField,
};

export const eventFilterToolFields = {
  ...eventFilterFields,
  ...removedFiltersGuardField,
};

export function filtersFromInput(
  input: Record<string, unknown>,
  options: { allowEvent?: boolean } = {},
): Filters | undefined {
  assertNoRemovedFilters(input);
  const allowEvent = options.allowEvent ?? true;
  const picked: Filters = {};

  for (const key of allFilterKeys) {
    if (key === 'event' && !allowEvent) {
      continue;
    }

    const value = input[key];

    if (value !== undefined && value !== null && value !== '') {
      if (key === 'match') {
        if (value === 'all' || value === 'any') {
          picked.match = value;
        }
        continue;
      }
      picked[key] = String(value);
    }
  }

  return Object.keys(picked).length ? picked : undefined;
}

export function assertNoEventFilter(
  filters: Filters | undefined,
  message = 'The event filter only applies on event analytics tools. To analyze a custom event, use get_event_stats or get_event_series.',
) {
  if (filters?.event) {
    throw new McpToolError('invalid_input', message);
  }
}

export function toFilterParams(filters?: Filters): Record<string, string> {
  const params: Record<string, string> = {};

  if (!filters) {
    return params;
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '' && FILTER_KEY_SET.has(key)) {
      params[key] = String(value);
    }
  }

  return params;
}
