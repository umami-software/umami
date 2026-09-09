import type { createDocument } from 'zod-openapi';

// Shared wording only belongs here when a field has the same meaning across endpoints.
// More specific descriptions in contracts always take precedence.
const fieldDescriptions: Record<string, string> = {
  id: 'Unique identifier of the resource.',
  name: 'Display name of the resource.',
  description: 'Description of the resource.',
  parameters: 'Configuration parameters for the resource.',
  createdAt: 'Date and time the record was created.',
  updatedAt: 'Date and time the record was last updated.',
  deletedAt: 'Date and time the record was deleted, if applicable.',
  resetAt: 'Date and time the website analytics were last reset.',
  createdBy: 'ID of the user who created the resource.',
  userId: 'ID of the associated user.',
  teamId: 'ID of the associated team.',
  websiteId: 'ID of the website.',
  boardId: 'ID of the board.',
  linkId: 'ID of the tracked link.',
  pixelId: 'ID of the tracking pixel.',
  reportId: 'ID of the saved report.',
  sessionId: 'ID of the visitor session.',
  eventId: 'ID of the event.',
  websiteEventId: 'ID of the website event.',
  annotationId: 'ID of the annotation.',
  segmentId: 'ID of the saved segment or cohort.',
  replayId: 'ID of the session replay.',
  shareId: 'Identifier used to access a shared resource.',
  keyId: 'ID of the API key.',
  visitId: 'ID of the visit.',
  entityId: 'ID of the resource being shared.',
  slug: 'URL slug used to access the resource.',
  username: 'Username of the account.',
  user: 'User associated with the resource.',
  team: 'Team associated with the resource.',
  teams: 'Teams associated with the user.',
  members: 'Members of the team.',
  createUser: 'User who created the resource.',
  boards: 'Boards associated with the user.',
  links: 'Tracked links associated with the user.',
  pixels: 'Tracking pixels associated with the user.',
  reports: 'Saved reports associated with the user.',
  apiKeys: 'API keys associated with the user.',
  password: 'Password used to authenticate the account.',
  currentPassword: 'Current account password.',
  newPassword: 'New password to set for the account.',
  isAdmin: 'Whether the user has administrator privileges.',
  role: 'Permission role assigned to the user.',
  accessCode: 'Code used to join the team.',
  logoUrl: 'URL of the logo image.',
  domain: 'Domain name associated with the resource.',
  url: 'URL associated with the resource.',
  page: 'Page number, starting at 1.',
  pageSize: 'Number of results per page.',
  maxResults: 'Maximum number of results to include.',
  limit: 'Maximum number of rows to return.',
  offset: 'Number of rows to skip before returning results.',
  orderBy: 'Field to sort the results by.',
  sortDescending: 'Whether to sort results in descending order.',
  search: 'Search text used to filter results.',
  isCapped: 'Whether the results were truncated by the maximum result limit.',
  data: 'Data returned by the operation.',
  count: 'Number of matching records.',
  startAt: 'Start of the date range as a Unix timestamp in milliseconds.',
  endAt: 'End of the date range as a Unix timestamp in milliseconds.',
  startDate: 'Start of the date range as an ISO 8601 date or date-time.',
  endDate: 'End of the date range as an ISO 8601 date or date-time.',
  timezone:
    'IANA time zone used to interpret dates and group results, for example America/New_York.',
  unit: 'Time interval used to group results: minute, hour, day, month, or year.',
  filters: 'Filters applied to the analytics data.',
  match: 'Whether records must match all filters or any filter.',
  segment: 'ID of a saved segment used to filter results.',
  cohort: 'ID of a saved cohort used to filter visitors.',
  excludeBounce: 'Set a non-empty value to exclude visits with only one pageview.',
  hostname: 'Hostname on which the activity occurred.',
  browser: 'Browser used by the visitor.',
  os: 'Operating system used by the visitor.',
  device: 'Device category used by the visitor.',
  screen: 'Screen resolution of the visitor device.',
  language: 'Preferred language reported by the visitor browser.',
  country: 'Country code of the visitor.',
  region: 'Region or subdivision of the visitor.',
  city: 'City of the visitor.',
  distinctId: 'Custom identifier assigned to the visitor.',
  urlPath: 'Path portion of the page URL.',
  urlQuery: 'Query string portion of the page URL.',
  referrerDomain: 'Domain of the referring page.',
  referrer: 'URL of the referring page.',
  title: 'Title of the page.',
  pageTitle: 'Title of the page.',
  eventName: 'Name of the custom event.',
  eventType: 'Event type: 1 for a pageview or 2 for a custom event.',
  tag: 'Tag attached to the tracked activity.',
  utmSource: 'UTM campaign source.',
  utmMedium: 'UTM campaign medium.',
  utmCampaign: 'UTM campaign name.',
  utmContent: 'UTM campaign content.',
  utmTerm: 'UTM campaign search term.',
  pageviews: 'Pageview counts for the selected period.',
  visitors: 'Unique visitor counts for the selected period.',
  visits: 'Visit counts for the selected period.',
  views: 'Pageview counts for the selected period.',
  bounces: 'Number of visits with only one pageview.',
  totaltime: 'Total visit duration in seconds.',
  firstAt: 'Date and time of the first recorded activity.',
  lastAt: 'Date and time of the most recent recorded activity.',
  comparison: 'Analytics for the comparison period.',
  uniqueEvents: 'Number of unique events.',
  average: 'Arithmetic mean of the numeric property values.',
  median: 'Median of the numeric property values.',
  min: 'Minimum numeric property value.',
  max: 'Maximum numeric property value.',
  currency: 'Currency code used for revenue values.',
  propertyName: 'Name of the custom event or session property.',
  propertyValue: 'Value of the custom property.',
  propertyKeys: 'Names of the custom properties.',
  propertyValues: 'Values of the custom properties.',
  dataKey: 'Name of the custom property.',
  dataType: 'Data type of the custom property.',
  stringValue: 'Custom property value stored as a string.',
  numberValue: 'Custom property value stored as a number.',
  dateValue: 'Custom property value stored as a date-time.',
  eventProperties: 'Custom properties recorded with the event.',
  minDuration: 'Minimum replay duration in seconds.',
  startedAt: 'Date and time the recording started.',
  endedAt: 'Date and time the recording ended.',
  chunkCount: 'Number of stored recording chunks.',
  eventCount: 'Number of recorded replay events.',
  isSaved: 'Whether the replay has been saved.',
  duration: 'Replay duration in milliseconds.',
  viewportW: 'Viewport width in pixels.',
  viewportH: 'Viewport height in pixels.',
  pageW: 'Page width in pixels.',
  pageH: 'Page height in pixels.',
  pageX: 'Horizontal position on the page in pixels.',
  pageY: 'Vertical position on the page in pixels.',
  recorderEnabled: 'Whether recording is enabled for the website.',
  replayConfig: 'Session replay and heatmap recording configuration.',
  replayEnabled: 'Whether session replay recording is enabled.',
  heatmapEnabled: 'Whether heatmap recording is enabled.',
  sampleRate: 'Fraction of sessions to record for replay, from 0 to 1.',
  heatmapSampleRate: 'Fraction of sessions to record for heatmaps, from 0 to 1.',
  maskLevel: 'Privacy masking level used by the recorder: strict or moderate.',
  blockSelector: 'CSS selector for elements excluded from recordings.',
  allDay: 'Whether the annotation applies to the entire day.',
  note: 'Text of the annotation.',
  apiKey: 'API key authentication details.',
  keyPrefix: 'Visible prefix used to identify an API key.',
  lastUsedAt: 'Date and time the credential was last used.',
  expiresAt: 'Date and time the credential expires.',
  revokedAt: 'Date and time the credential was revoked.',
  usedAt: 'Date and time the code was used.',
  backupCode: 'Single-use backup code for two-factor authentication.',
  backupCodes: 'Single-use backup codes for two-factor authentication.',
  twoFactorRequired: 'Whether two-factor authentication is required.',
  requiresTwoFactor: 'Whether login requires a second authentication factor.',
  isEnabled: 'Whether two-factor authentication is enabled.',
  isConfigured: 'Whether two-factor authentication has been configured.',
  isRequired: 'Whether two-factor authentication is required for this user.',
  globalRequired: 'Whether two-factor authentication is required for all users.',
  requiredReason: 'Reason two-factor authentication is required.',
  partialToken: 'Temporary login token used to complete two-factor authentication.',
  manualKey: 'Secret key for manually configuring an authenticator app.',
  qrCodeDataUrl: 'Data URL of the QR code for authenticator setup.',
  lockedUntil: 'Time until which further authentication attempts are blocked.',
  error: 'Error details returned when the operation fails.',
  message: 'Human-readable explanation of the result.',
  ok: 'Whether the operation succeeded.',
  shareType: 'Type of resource made available by the share.',
};

const queryDescriptions: Record<string, string> = {
  compare: 'Comparison period: prev for the previous period or yoy for the same period last year.',
  ids: 'Comma-separated resource IDs. Provide between 1 and 20 IDs.',
  includeTeams: 'Set a non-empty value to include websites accessible through team membership.',
  type: 'Type of resource or analytics dimension to return.',
  metric: 'Numeric aggregation to calculate for the selected property.',
  path: 'Filter by page URL path.',
  referrer: 'Filter by referring URL.',
  title: 'Filter by page title.',
  query: 'Filter by page URL query string.',
  event: 'Filter by custom event name.',
};

const dashboardDescriptions: Record<string, string> = {
  id: 'Dashboard board ID, equal to the owning user ID.',
  name: 'Display name of the dashboard.',
  description: 'Description of the dashboard.',
  parameters: 'Dashboard configuration, including components, layout, and saved reports.',
  userId: 'ID of the user who owns the dashboard.',
  teamId: 'ID of the associated team, if any.',
  type: 'Board type used for the dashboard.',
};

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function describeSchema(value: unknown, overrides: Record<string, string> = {}) {
  if (!isObject(value)) return;

  if (isObject(value.properties)) {
    for (const [name, property] of Object.entries(value.properties)) {
      if (!isObject(property)) continue;
      const description = overrides[name] ?? fieldDescriptions[name];
      if (!property.description && description) property.description = description;
      describeSchema(property);
    }
  }

  for (const keyword of ['items', 'additionalProperties', 'not', 'if', 'then', 'else']) {
    describeSchema(value[keyword]);
  }
  for (const keyword of ['allOf', 'anyOf', 'oneOf', 'prefixItems']) {
    const schemas = value[keyword];
    if (Array.isArray(schemas)) {
      schemas.forEach(schema => {
        describeSchema(schema, overrides);
      });
    }
  }
}

// Visit only OpenAPI containers and schema keywords, never example/default payloads.
function describeContent(value: unknown, overrides: Record<string, string> = {}) {
  if (!isObject(value)) return;
  if (isObject(value.content)) {
    for (const media of Object.values(value.content)) {
      if (isObject(media)) describeSchema(media.schema, overrides);
    }
  }
}

function describeParameters(value: unknown) {
  if (!Array.isArray(value)) return;
  for (const parameter of value) {
    if (!isObject(parameter) || typeof parameter.name !== 'string') continue;
    const schema = isObject(parameter.schema) ? parameter.schema : undefined;
    const description =
      schema?.description ??
      (parameter.in === 'query' ? queryDescriptions[parameter.name] : undefined) ??
      fieldDescriptions[parameter.name];
    if (!parameter.description && description) parameter.description = description;
    describeSchema(schema);
    describeContent(parameter);
  }
}

export function applyFieldDescriptions(document: ReturnType<typeof createDocument>) {
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isObject(pathItem)) continue;
    describeParameters(pathItem.parameters);
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']) {
      const operation = pathItem[method];
      if (!isObject(operation)) continue;
      const overrides = path === '/api/dashboard' ? dashboardDescriptions : {};
      describeParameters(operation.parameters);
      describeContent(operation.requestBody, overrides);
      if (isObject(operation.responses)) {
        Object.values(operation.responses).forEach(response => {
          describeContent(response, overrides);
        });
      }
    }
  }

  const components = document.components;
  Object.values(components?.schemas ?? {}).forEach(schema => {
    describeSchema(schema);
  });
  Object.values(components?.responses ?? {}).forEach(response => {
    describeContent(response);
  });
  Object.values(components?.requestBodies ?? {}).forEach(body => {
    describeContent(body);
  });
  describeParameters(Object.values(components?.parameters ?? {}));
}
