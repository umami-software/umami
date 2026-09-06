import { z } from 'zod';

const filterValue = z
  .string()
  .min(1)
  .describe(
    'Exact match by default. Prefix with an operator for other comparisons: "neq.value" (not equals), "c.value" (contains), "dnc.value" (does not contain), "re.regex", "nre.regex". Comma-separate multiple exact values: "chrome,firefox".',
  );

export const filtersSchema = z
  .object({
    path: filterValue.optional().describe('Page path, e.g. "/pricing".'),
    referrer: filterValue.optional().describe('Referrer domain, e.g. "google.com".'),
    title: filterValue.optional().describe('Page title.'),
    query: filterValue.optional().describe('URL query string.'),
    hostname: filterValue.optional().describe('Hostname the page was served from.'),
    event: filterValue.optional().describe('Custom event name.'),
    tag: filterValue.optional().describe('Tracker tag.'),
    browser: filterValue.optional().describe('Browser name, e.g. "chrome".'),
    os: filterValue.optional().describe('Operating system, e.g. "Mac OS".'),
    device: filterValue.optional().describe('Device type: desktop, laptop, tablet or mobile.'),
    country: filterValue.optional().describe('ISO 3166-1 alpha-2 country code, e.g. "US".'),
    region: filterValue.optional().describe('Region code, e.g. "US-CA".'),
    city: filterValue.optional().describe('City name.'),
    language: filterValue.optional().describe('Browser language, e.g. "en-US".'),
    distinctId: filterValue.optional().describe('Identified user ID (distinct ID).'),
    utmSource: filterValue.optional(),
    utmMedium: filterValue.optional(),
    utmCampaign: filterValue.optional(),
    utmContent: filterValue.optional(),
    utmTerm: filterValue.optional(),
    segment: z.string().uuid().optional().describe('Saved segment ID to apply.'),
    match: z
      .enum(['all', 'any'])
      .optional()
      .describe('Whether all filters must match (default) or any filter may match.'),
  })
  .strict()
  .describe('Optional analytics filters. Only include keys you want to filter on.');

export type Filters = z.infer<typeof filtersSchema>;

export function toFilterParams(filters?: Filters): Record<string, string> {
  const params: Record<string, string> = {};

  if (!filters) {
    return params;
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  }

  return params;
}
