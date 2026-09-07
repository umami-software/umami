import type { ApiHttpMethod } from '@/openapi/operation';

interface OperationDescription {
  summary: string;
  description?: string;
}

// Hand-maintained documentation. OpenAPI generators must never overwrite this file.
// Keys use the HTTP method and OpenAPI path, including {parameter} placeholders.
export const operationDescriptions: Record<string, OperationDescription> = {
  'POST /api/2fa/disable': {
    summary: 'Disable two-factor authentication',
    description:
      'Disables two-factor authentication for the current user after verifying their password and authenticator code. Rejected when an administrator or team requires it.',
  },
  'POST /api/2fa/setup/cancel': {
    summary: 'Cancel two-factor authentication setup',
    description:
      "Deletes the current user's pending setup without changing an already enabled authenticator.",
  },
  'POST /api/2fa/setup/confirm': {
    summary: 'Confirm two-factor authentication setup',
    description:
      'Verifies an authenticator code, enables two-factor authentication, and returns a new set of backup codes.',
  },
  'POST /api/2fa/setup/initiate': {
    summary: 'Set up two-factor authentication',
    description:
      "Starts or replaces the current user's pending setup and returns a QR code and manual setup key for an authenticator app.",
  },
  'GET /api/2fa/status': {
    summary: 'Get two-factor authentication status',
    description:
      'Returns whether two-factor authentication is enabled, configured, or required for the current user, including the reason it is required.',
  },
  'POST /api/2fa/verify': {
    summary: 'Complete two-factor sign-in',
    description:
      'Exchanges a partial sign-in token and a valid authenticator or backup code for a full authentication token and user details.',
  },
  'POST /api/admin/2fa/global': {
    summary: 'Set the two-factor requirement for everyone',
    description:
      'Enables or disables the installation-wide requirement for users to set up two-factor authentication.',
  },
  'GET /api/admin/teams': {
    summary: 'List all teams',
    description:
      'Returns a paginated list of teams with member details and website and member counts for administration.',
  },
  'POST /api/admin/teams/{teamId}/2fa': {
    summary: "Set a team's two-factor requirement",
    description:
      'Enables or disables the requirement for members of the specified team to use two-factor authentication.',
  },
  'GET /api/admin/users': {
    summary: 'List all users',
    description:
      'Returns a paginated list of users and their website counts for administration, excluding passwords.',
  },
  'DELETE /api/admin/users/{userId}/2fa': {
    summary: "Reset a user's two-factor authentication",
    description:
      "Removes the specified user's authenticator setup, backup codes, used-code history, and failed-attempt limits so they can set up authentication again.",
  },
  'GET /api/admin/users/{userId}/2fa': {
    summary: "Get a user's two-factor status",
    description: 'Returns whether two-factor authentication is enabled for the specified user.',
  },
  'POST /api/admin/users/{userId}/2fa': {
    summary: "Set a user's two-factor requirement",
    description:
      'Enables or disables the requirement for the specified user to set up two-factor authentication.',
  },
  'GET /api/admin/websites': {
    summary: 'List all websites',
    description:
      'Returns a paginated, searchable list of websites across users and teams for administration.',
  },
  'POST /api/auth/login': {
    summary: 'Log in',
    description:
      'Authenticates a user with a username and password. Users with two-factor authentication receive a short-lived partial token to complete sign-in.',
  },
  'POST /api/auth/logout': {
    summary: 'Log out',
    description:
      'Ends the current authentication session by removing its stored token when Redis-backed sessions are enabled.',
  },
  'POST /api/auth/sso': {
    summary: 'Create a single sign-on token',
    description:
      'Returns the authenticated user and a new token valid for 24 hours. Requires Redis-backed authentication.',
  },
  'GET /api/auth/subscription': {
    summary: 'Get subscription details',
    description:
      'Returns subscription and feature availability for the current user or a specified team the user can access.',
  },
  'POST /api/auth/verify': {
    summary: 'Verify the current sign-in',
    description:
      'Validates the current authentication credentials and returns the user and their team memberships.',
  },
  'POST /api/batch': {
    summary: 'Send a batch of tracking requests',
    description:
      'Processes up to 500 tracking payloads and returns processed and failed counts, individual error details, and a tracking cache token.',
  },
  'GET /api/boards': {
    summary: 'List my boards',
    description:
      "Returns a paginated list of the current user's boards, with search and sorting options.",
  },
  'POST /api/boards': {
    summary: 'Create a board',
    description:
      'Creates a board with a name, type, and configuration, optionally assigned to a team. Validates access to its referenced resources and reports.',
  },
  'DELETE /api/boards/{boardId}': {
    summary: 'Delete a board',
    description: "Deletes the specified board after checking the caller's permission to remove it.",
  },
  'GET /api/boards/{boardId}': {
    summary: 'Get a board',
    description: 'Returns the specified board and its configuration.',
  },
  'POST /api/boards/{boardId}': {
    summary: 'Update a board',
    description:
      "Updates a board's name, description, or configuration and validates the resources and reports it references.",
  },
  'POST /api/boards/{boardId}/clone': {
    summary: 'Clone a board',
    description:
      'Creates a copy of a board with optional changes to its name, description, and configuration. Removes invalid report references from the copy.',
  },
  'GET /api/boards/{boardId}/shares': {
    summary: 'List shares for a board',
    description: 'Returns a paginated list of shares for the specified board.',
  },
  'POST /api/boards/{boardId}/shares': {
    summary: 'Create a share for a board',
    description: 'Creates a named share for the specified board with optional parameters.',
  },
  'GET /api/config': {
    summary: 'Get application configuration',
    description:
      'Returns public application settings, including deployment mode, feature availability, and tracker and resource URLs.',
  },
  'GET /api/dashboard': {
    summary: 'Get my dashboard',
    description: "Returns the current user's personal dashboard board and its configuration.",
  },
  'POST /api/dashboard': {
    summary: 'Save my dashboard',
    description:
      "Creates or updates the current user's personal dashboard with the supplied name, description, and configuration.",
  },
  'GET /api/heartbeat': {
    summary: 'Check application availability',
    description:
      'Returns a simple success response to confirm that the application can serve requests.',
  },
  'GET /api/links': {
    summary: 'List my links',
    description:
      "Returns a paginated list of the current user's tracked links, with search and sorting options.",
  },
  'POST /api/links': {
    summary: 'Create a tracked link',
    description:
      'Creates a tracked link with a name, destination URL, and slug, optionally assigned to a team.',
  },
  'DELETE /api/links/{linkId}': {
    summary: 'Delete a tracked link',
    description:
      "Deletes the specified tracked link after checking the caller's permission to remove it.",
  },
  'GET /api/links/{linkId}': {
    summary: 'Get a tracked link',
    description: 'Returns the specified tracked link, including its destination URL and slug.',
  },
  'POST /api/links/{linkId}': {
    summary: 'Update a tracked link',
    description: "Updates a tracked link's name, destination URL, or slug.",
  },
  'GET /api/links/{linkId}/shares': {
    summary: 'List shares for a link',
    description: 'Returns a paginated list of shares for the specified link.',
  },
  'POST /api/links/{linkId}/shares': {
    summary: 'Create a share for a link',
    description: 'Creates a named share for the specified link with optional parameters.',
  },
  'GET /api/links/charts': {
    summary: 'Get visitor charts for links',
    description:
      'Returns visitor totals and chart data for the requested links the caller can view, within the selected date range.',
  },
  'GET /api/me': {
    summary: 'Get my authentication details',
    description:
      'Returns the current authentication context, including the authenticated user or share credentials.',
  },
  'GET /api/me/api-keys': {
    summary: 'List my API keys',
    description:
      "Returns metadata for the current user's API keys. Available on self-hosted installations.",
  },
  'POST /api/me/api-keys': {
    summary: 'Create an API key',
    description:
      'Creates a named API key for the current user and returns its secret value. Available on self-hosted installations.',
  },
  'DELETE /api/me/api-keys/{keyId}': {
    summary: 'Delete an API key',
    description:
      'Deletes an API key belonging to the current user, revoking its access. Available on self-hosted installations.',
  },
  'POST /api/me/password': {
    summary: 'Change my password',
    description: 'Verifies the current password and replaces it with the supplied new password.',
  },
  'GET /api/me/teams': {
    summary: 'List my team memberships',
    description:
      'Returns a paginated list of teams the current user belongs to, with sorting options.',
  },
  'GET /api/me/websites': {
    summary: 'List my websites',
    description:
      "Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.",
  },
  'GET /api/oauth/authorize': {
    summary: 'Get OAuth authorization request details',
    description:
      'Validates an OAuth authorization request and returns the client and requested permissions for the consent screen. Requires an interactive user session.',
  },
  'POST /api/oauth/authorize': {
    summary: 'Approve or deny OAuth access',
    description:
      "Records the user's consent decision and returns a redirect URL. Approval includes an authorization code, the request state, and the issuer.",
  },
  'POST /api/oauth/register': {
    summary: 'Register an OAuth client',
    description:
      'Registers a public OAuth client for clients that do not support Client ID Metadata Documents. Clients that support them should use an HTTPS metadata URL as their client ID.',
  },
  'POST /api/oauth/revoke': {
    summary: 'Revoke an OAuth refresh token',
    description:
      'Revokes the supplied refresh token. Unknown tokens are accepted without revealing whether they existed.',
  },
  'POST /api/oauth/token': {
    summary: 'Get or refresh an OAuth access token',
    description:
      'Exchanges an authorization code and PKCE verifier, or a refresh token, for an access token. Accepts form-encoded or JSON requests and rotates refresh tokens on use.',
  },
  'GET /api/pixels': {
    summary: 'List my tracking pixels',
    description:
      "Returns a paginated list of the current user's tracking pixels, with search and sorting options.",
  },
  'POST /api/pixels': {
    summary: 'Create a tracking pixel',
    description: 'Creates a tracking pixel with a name and slug, optionally assigned to a team.',
  },
  'DELETE /api/pixels/{pixelId}': {
    summary: 'Delete a tracking pixel',
    description:
      "Deletes the specified tracking pixel after checking the caller's permission to remove it.",
  },
  'GET /api/pixels/{pixelId}': {
    summary: 'Get a tracking pixel',
    description: 'Returns the specified tracking pixel and its configuration.',
  },
  'POST /api/pixels/{pixelId}': {
    summary: 'Update a tracking pixel',
    description: "Updates a tracking pixel's name or slug.",
  },
  'GET /api/pixels/{pixelId}/shares': {
    summary: 'List shares for a tracking pixel',
    description: 'Returns a paginated list of shares for the specified tracking pixel.',
  },
  'POST /api/pixels/{pixelId}/shares': {
    summary: 'Create a share for a tracking pixel',
    description: 'Creates a named share for the specified tracking pixel with optional parameters.',
  },
  'GET /api/pixels/charts': {
    summary: 'Get visitor charts for tracking pixels',
    description:
      'Returns visitor totals and chart data for the requested pixels the caller can view, within the selected date range.',
  },
  'GET /api/realtime/{websiteId}': {
    summary: 'Get real-time website activity',
    description:
      'Returns recent website activity and visitor data for the real-time view, applying the supplied filters.',
  },
  'POST /api/record': {
    summary: 'Send session recordings or heatmap data',
    description:
      'Stores session replay events or heatmap clicks and scrolls for a website, using a valid tracking cache token to identify the session and visit.',
  },
  'GET /api/reports': {
    summary: 'List saved reports',
    description:
      'Returns a paginated list of saved reports for the requested website, optionally filtered by report type.',
  },
  'POST /api/reports': {
    summary: 'Save a report',
    description:
      "Saves a report's name, description, type, and parameters for a website so it can be opened again later.",
  },
  'DELETE /api/reports/{reportId}': {
    summary: 'Delete a saved report',
    description: 'Deletes the specified saved report definition.',
  },
  'GET /api/reports/{reportId}': {
    summary: 'Get a saved report',
    description: "Returns the specified report's saved name, description, type, and parameters.",
  },
  'POST /api/reports/{reportId}': {
    summary: 'Update a saved report',
    description: "Updates the specified report's website, name, description, type, and parameters.",
  },
  'POST /api/reports/attribution': {
    summary: 'Run an attribution report',
    description:
      'Calculates how traffic sources contribute to conversions using the supplied attribution settings, date range, and filters.',
  },
  'POST /api/reports/breakdown': {
    summary: 'Run a breakdown report',
    description:
      'Groups website activity by the selected dimensions for the requested date range and filters.',
  },
  'POST /api/reports/funnel': {
    summary: 'Run a funnel report',
    description:
      'Calculates visitor progression through a sequence of pages or events using the supplied funnel steps and filters.',
  },
  'POST /api/reports/goal': {
    summary: 'Run a goal report',
    description:
      'Counts visitors who reached a matching page or triggered a matching event and returns the total visitor count for comparison.',
  },
  'POST /api/reports/heatmap': {
    summary: 'Get page heatmap data',
    description:
      'Returns recorded click or scroll data for the selected page and date range to display as a heatmap.',
  },
  'POST /api/reports/journey': {
    summary: 'Run a visitor journey report',
    description:
      'Returns paths through pages or events using the supplied journey settings and website filters.',
  },
  'POST /api/reports/performance': {
    summary: 'Run a performance report',
    description:
      'Returns performance trends, summary metrics, and breakdowns by page, page title, device, and browser for the selected website and date range.',
  },
  'POST /api/reports/retention': {
    summary: 'Run a retention report',
    description:
      'Calculates how groups of visitors return over time using the supplied retention settings, date range, and filters.',
  },
  'POST /api/reports/revenue': {
    summary: 'Run a revenue report',
    description:
      'Returns revenue trends, totals with a comparison period, and breakdowns by country, region, referrer, and channel.',
  },
  'POST /api/reports/utm': {
    summary: 'Run a campaign report',
    description:
      'Returns traffic breakdowns for UTM source, medium, campaign, term, and content using the supplied date range and filters.',
  },
  'GET /api/scripts/telemetry': {
    summary: 'Get the installation telemetry script',
    description:
      'Returns JavaScript that sends the application version through a telemetry pixel, or an inactive script when telemetry is disabled.',
  },
  'POST /api/send': {
    summary: 'Send tracking data',
    description:
      'Collects a pageview, custom event, visitor identification, or performance payload and returns session information and a tracking cache token when accepted.',
  },
  'POST /api/share': {
    summary: 'Create a share',
    description:
      'Creates a named share for a website, board, link, or pixel with parameters and an optional custom slug.',
  },
  'GET /api/share/{slug}': {
    summary: 'Open a share by its slug',
    description:
      'Resolves a public share slug and returns its resource references, parameters, and an access token scoped to the shared resources.',
  },
  'DELETE /api/share/id/{shareId}': {
    summary: 'Delete a share',
    description:
      'Deletes the specified share after checking permission to delete shares for its resource.',
  },
  'GET /api/share/id/{shareId}': {
    summary: 'Get a share',
    description:
      "Returns a share's configuration by its ID after checking access to the shared resource.",
  },
  'POST /api/share/id/{shareId}': {
    summary: 'Update a share',
    description: "Updates the specified share's name, slug, and parameters.",
  },
  'GET /api/teams': {
    summary: 'List my teams',
    description:
      'Returns a paginated list of teams the current user belongs to, with sorting options.',
  },
  'POST /api/teams': {
    summary: 'Create a team',
    description:
      'Creates a team with an access code and an owner. Administrators can specify a different user as the owner.',
  },
  'DELETE /api/teams/{teamId}': {
    summary: 'Delete a team',
    description: "Deletes the specified team after checking the caller's permission to remove it.",
  },
  'GET /api/teams/{teamId}': {
    summary: 'Get a team',
    description: "Returns the specified team's details, including its members.",
  },
  'POST /api/teams/{teamId}': {
    summary: 'Update a team',
    description: "Updates the specified team's name or access code.",
  },
  'GET /api/teams/{teamId}/boards': {
    summary: "List a team's boards",
    description:
      'Returns a paginated list of boards belonging to the specified team, with search and sorting options.',
  },
  'GET /api/teams/{teamId}/links': {
    summary: "List a team's links",
    description:
      'Returns a paginated list of tracked links belonging to the specified team, with search and sorting options.',
  },
  'GET /api/teams/{teamId}/pixels': {
    summary: "List a team's tracking pixels",
    description:
      'Returns a paginated list of tracking pixels belonging to the specified team, with search and sorting options.',
  },
  'GET /api/teams/{teamId}/users': {
    summary: 'List team members',
    description:
      'Returns a paginated list of members of the specified team, including usernames and membership details.',
  },
  'POST /api/teams/{teamId}/users': {
    summary: 'Add a team member',
    description: 'Adds an existing user to the specified team with the supplied team role.',
  },
  'DELETE /api/teams/{teamId}/users/{userId}': {
    summary: 'Remove a team member',
    description:
      "Removes a user's membership from the specified team, subject to team role and ownership restrictions.",
  },
  'GET /api/teams/{teamId}/users/{userId}': {
    summary: 'Get a team member',
    description: "Returns the specified user's membership details for a team.",
  },
  'POST /api/teams/{teamId}/users/{userId}': {
    summary: "Change a team member's role",
    description:
      "Updates a user's role in the specified team, subject to the caller's role and permissions.",
  },
  'GET /api/teams/{teamId}/websites': {
    summary: "List a team's websites",
    description:
      'Returns a paginated list of websites belonging to the specified team, with search and sorting options.',
  },
  'POST /api/teams/join': {
    summary: 'Join a team',
    description: "Adds the current user to a team as a member using the team's access code.",
  },
  'POST /api/users': {
    summary: 'Create a user',
    description: 'Creates a user account with the supplied username, password, and role.',
  },
  'DELETE /api/users/{userId}': {
    summary: 'Delete a user',
    description:
      'Deletes the specified user account. The current user cannot delete their own account through this operation.',
  },
  'GET /api/users/{userId}': {
    summary: 'Get a user',
    description:
      'Returns details for the specified user account when the caller has permission to view it.',
  },
  'POST /api/users/{userId}': {
    summary: 'Update a user',
    description: "Updates a user's password. Administrators can also change the username and role.",
  },
  'GET /api/users/{userId}/teams': {
    summary: "List a user's teams",
    description:
      'Returns a paginated list of teams for the specified user. Available to that user and administrators.',
  },
  'GET /api/users/{userId}/websites': {
    summary: "List a user's websites",
    description:
      "Returns a paginated list of the specified user's websites, optionally including team access. Available to that user and administrators.",
  },
  'GET /api/websites': {
    summary: 'List websites',
    description:
      "Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.",
  },
  'POST /api/websites': {
    summary: 'Create a website',
    description:
      'Creates a website with a name and domain, optionally assigning it to a team and creating a share.',
  },
  'DELETE /api/websites/{websiteId}': {
    summary: 'Delete a website',
    description:
      "Deletes the specified website after checking the caller's permission to remove it.",
  },
  'GET /api/websites/{websiteId}': {
    summary: 'Get a website',
    description: "Returns the specified website's details and configuration.",
  },
  'POST /api/websites/{websiteId}': {
    summary: 'Update a website',
    description: "Updates a website's name, domain, sharing settings, or recording configuration.",
  },
  'GET /api/websites/{websiteId}/active': {
    summary: 'Get active website visitors',
    description: 'Returns the number of visitors active on the website in the last few minutes.',
  },
  'GET /api/websites/{websiteId}/annotations': {
    summary: 'List website annotations',
    description:
      'Returns a paginated list of dated notes for the website, optionally filtered by date range or search text.',
  },
  'POST /api/websites/{websiteId}/annotations': {
    summary: 'Create a website annotation',
    description:
      'Adds a dated note to the website, optionally marking it as an all-day annotation.',
  },
  'DELETE /api/websites/{websiteId}/annotations/{annotationId}': {
    summary: 'Delete a website annotation',
    description: 'Deletes the specified dated note from the website.',
  },
  'GET /api/websites/{websiteId}/annotations/{annotationId}': {
    summary: 'Get a website annotation',
    description: 'Returns the date, all-day setting, and note for a specific website annotation.',
  },
  'POST /api/websites/{websiteId}/annotations/{annotationId}': {
    summary: 'Update a website annotation',
    description: 'Changes the date, all-day setting, and note for a website annotation.',
  },
  'GET /api/websites/{websiteId}/daterange': {
    summary: "Get the website's available date range",
    description: 'Returns the earliest and latest recorded event dates for the website.',
  },
  'GET /api/websites/{websiteId}/event-data': {
    summary: 'List events with custom properties',
    description:
      "Returns a page of events in the selected date range, grouping each event's custom property records together.",
  },
  'GET /api/websites/{websiteId}/event-data-pivot': {
    summary: 'List event properties in table form',
    description:
      'Returns a page of occurrences of the specified event, with event details and property keys and values grouped into one row per occurrence.',
  },
  'GET /api/websites/{websiteId}/event-data-pivot/array-series': {
    summary: 'Get event array values over time',
    description:
      'Counts individual values in an array property for the specified event, grouped by value and time interval.',
  },
  'GET /api/websites/{websiteId}/event-data-pivot/date-series': {
    summary: 'Get the distribution of event date values',
    description:
      "Counts occurrences of dates stored in the specified event property, grouping by the property's date value within the selected event date range.",
  },
  'GET /api/websites/{websiteId}/event-data-pivot/numeric-series': {
    summary: 'Get numeric event properties over time',
    description:
      'Returns the sum, average, or count of a numeric property for the specified event, grouped by time interval.',
  },
  'GET /api/websites/{websiteId}/event-data-pivot/numeric-stats': {
    summary: 'Get numeric event property statistics',
    description:
      'Returns the total, average, median, minimum, and maximum of the specified numeric event property for the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/event-data-pivot/property-series': {
    summary: 'Get event property values over time',
    description:
      'Counts occurrences of string values in the specified event property, grouped by value and time interval.',
  },
  'GET /api/websites/{websiteId}/event-data/{eventId}': {
    summary: "Get an event's custom properties",
    description:
      'Returns the custom property records, data types, and values attached to a specific event.',
  },
  'GET /api/websites/{websiteId}/event-data/events': {
    summary: 'Summarize properties by event',
    description:
      'Returns property names, types, and counts grouped by event name. When an event is specified, also groups by property value.',
  },
  'GET /api/websites/{websiteId}/event-data/fields': {
    summary: 'List event property fields',
    description:
      'Returns property names, data types, and counts for the selected date range, optionally restricted to an event name.',
  },
  'GET /api/websites/{websiteId}/event-data/properties': {
    summary: 'List event property usage',
    description:
      'Returns event names and their custom property names, data types, and record counts for the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/event-data/stats': {
    summary: 'Get event property totals',
    description:
      'Returns counts of events with custom data, distinct property names, and property records for the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/event-data/values': {
    summary: 'List event property values',
    description:
      'Returns values and their occurrence counts for a custom event property, optionally restricted by event name and data type.',
  },
  'GET /api/websites/{websiteId}/events': {
    summary: 'List tracked events',
    description:
      'Returns a page of pageviews and custom events in the date range, newest first. Supports filtering by event name and searching event details.',
  },
  'GET /api/websites/{websiteId}/events/series': {
    summary: 'Get custom event counts over time',
    description:
      'Returns counts grouped by event name and time interval, optionally limited to the most frequent event names.',
  },
  'GET /api/websites/{websiteId}/events/stats': {
    summary: 'Get website event statistics',
    description:
      'Returns website event totals for the selected date range and filters, including totals for the comparison period.',
  },
  'GET /api/websites/{websiteId}/export': {
    summary: 'Export website analytics',
    description:
      'Returns a base64-encoded ZIP archive containing CSV exports of events, pages, referrers, browsers, operating systems, devices, and countries.',
  },
  'GET /api/websites/{websiteId}/metrics': {
    summary: 'Get ranked website metrics',
    description:
      'Returns the most frequent values for a dimension such as pages, referrers, countries, browsers, campaigns, or events. Counts pageviews or events for activity dimensions and unique visitors for visitor dimensions.',
  },
  'GET /api/websites/{websiteId}/metrics/expanded': {
    summary: 'Get detailed website metrics',
    description:
      'Returns additional analytics for the selected page, event, visitor, or channel dimension, using the supplied date range and filters.',
  },
  'GET /api/websites/{websiteId}/pageviews': {
    summary: 'Get pageviews and sessions over time',
    description:
      'Returns pageviews and sessions grouped by the requested time interval and timezone, including a comparison period when requested.',
  },
  'GET /api/websites/{websiteId}/recorder': {
    summary: 'Get website recording settings',
    description:
      'Returns public replay and heatmap settings, including sampling, masking, and duration limits. Returns disabled status when recording is unavailable.',
  },
  'GET /api/websites/{websiteId}/replays': {
    summary: 'List website session replays',
    description:
      'Returns a paginated list of recorded sessions for the website, applying date, replay, and search filters.',
  },
  'GET /api/websites/{websiteId}/replays/{replayId}': {
    summary: 'Get a session replay recording',
    description:
      'Returns the merged recording events, session details, and event and chunk counts for a replay, with optional stopping points by timestamp, chunk, or event index.',
  },
  'GET /api/websites/{websiteId}/replays/saved': {
    summary: 'List saved session replays',
    description: 'Returns a paginated, searchable list of replays saved for the website.',
  },
  'GET /api/websites/{websiteId}/replays/saved/{replayId}': {
    summary: 'Check whether a replay is saved',
    description: "Returns whether the specified replay is in the website's saved replays.",
  },
  'POST /api/websites/{websiteId}/replays/saved/{replayId}': {
    summary: 'Save or unsave a session replay',
    description:
      "Adds a replay to the website's saved replays with an optional name, or removes it when isSaved is false.",
  },
  'GET /api/websites/{websiteId}/reports': {
    summary: "List a website's saved reports",
    description:
      'Returns a paginated list of saved report definitions for the website, optionally filtered by report type.',
  },
  'POST /api/websites/{websiteId}/reset': {
    summary: 'Reset website analytics',
    description:
      "Clears the website's collected analytics data while keeping the website configuration.",
  },
  'GET /api/websites/{websiteId}/revenue/chart': {
    summary: 'Get website revenue over time',
    description:
      'Returns revenue chart data for the selected currency, date range, and website filters.',
  },
  'GET /api/websites/{websiteId}/revenue/metrics': {
    summary: 'Get website revenue by dimension',
    description:
      'Returns revenue grouped by the requested dimension, such as country or referrer, for the selected currency and date range.',
  },
  'GET /api/websites/{websiteId}/revenue/sessions': {
    summary: 'List sessions with revenue',
    description:
      'Returns a paginated list of sessions with revenue in the selected currency and date range, applying website and search filters.',
  },
  'GET /api/websites/{websiteId}/revenue/stats': {
    summary: 'Get website revenue totals',
    description:
      'Returns revenue summary statistics for the selected currency and date range, including totals for the comparison period.',
  },
  'GET /api/websites/{websiteId}/segments': {
    summary: 'List website segments and cohorts',
    description:
      'Returns saved segments or cohorts for the website, filtered by the requested type and search text.',
  },
  'POST /api/websites/{websiteId}/segments': {
    summary: 'Create a website segment or cohort',
    description:
      'Saves a named segment or cohort with its type and filter parameters for the website.',
  },
  'DELETE /api/websites/{websiteId}/segments/{segmentId}': {
    summary: 'Delete a website segment or cohort',
    description: 'Deletes the specified saved segment or cohort from the website.',
  },
  'GET /api/websites/{websiteId}/segments/{segmentId}': {
    summary: 'Get a website segment or cohort',
    description: 'Returns a saved segment or cohort and its filter parameters for the website.',
  },
  'POST /api/websites/{websiteId}/segments/{segmentId}': {
    summary: 'Update a website segment or cohort',
    description: "Updates a saved segment or cohort's type, name, and filter parameters.",
  },
  'GET /api/websites/{websiteId}/session-data-pivot': {
    summary: 'List session properties in table form',
    description:
      'Returns a page of sessions matching the selected property and filters, with the latest property keys and values grouped into one row per session.',
  },
  'GET /api/websites/{websiteId}/session-data/array-series': {
    summary: 'Get session array values over time',
    description:
      'Counts distinct sessions for individual values in an array property, grouped by value and time interval.',
  },
  'GET /api/websites/{websiteId}/session-data/date-series': {
    summary: 'Get the distribution of session date values',
    description:
      'Counts distinct sessions by dates stored in the specified custom property, using the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/session-data/numeric-series': {
    summary: 'Get numeric session properties over time',
    description:
      'Returns the sum, average, or count of a numeric session property, grouped by time interval for the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/session-data/numeric-stats': {
    summary: 'Get numeric session property statistics',
    description:
      'Returns the total, average, median, minimum, and maximum of the specified numeric session property for the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/session-data/properties': {
    summary: 'List session property usage',
    description:
      'Returns custom session property names, data types, and distinct session counts, optionally restricted to sessions with a selected property.',
  },
  'GET /api/websites/{websiteId}/session-data/property-series': {
    summary: 'Get session property values over time',
    description:
      'Counts distinct sessions for string values in a custom property, grouped by value and time interval.',
  },
  'GET /api/websites/{websiteId}/session-data/stats': {
    summary: 'Get activity by session property',
    description:
      'Returns session, visit, pageview, event, and total activity counts grouped by values of the specified session property.',
  },
  'GET /api/websites/{websiteId}/session-data/values': {
    summary: 'List session property values',
    description:
      'Returns custom session property values and their occurrence counts, optionally filtered by property name and data type.',
  },
  'GET /api/websites/{websiteId}/sessions': {
    summary: 'List visitor sessions',
    description:
      'Returns a page of visitor sessions in the date range, newest first. Search matches distinct ID, city, browser, operating system, or device.',
  },
  'DELETE /api/websites/{websiteId}/sessions/{sessionId}': {
    summary: 'Delete a visitor session',
    description:
      'Deletes the specified session and its associated analytics data. Available on installations using only a relational database.',
  },
  'GET /api/websites/{websiteId}/sessions/{sessionId}': {
    summary: 'Get a visitor session',
    description:
      'Returns details for a website session, including linked visitor identities and whether session deletion is available to the caller.',
  },
  'GET /api/websites/{websiteId}/sessions/{sessionId}/activity': {
    summary: "Get a visitor's session activity",
    description:
      'Returns activity for the specified session and sessions linked by visitor identity, using the requested date range and optional distinct ID.',
  },
  'GET /api/websites/{websiteId}/sessions/{sessionId}/properties': {
    summary: "Get a session's custom properties",
    description:
      'Returns custom property records, data types, and values for the specified website session.',
  },
  'GET /api/websites/{websiteId}/sessions/{sessionId}/replays': {
    summary: "List a visitor's session replays",
    description:
      'Returns a paginated, searchable list of recordings for the specified website session.',
  },
  'GET /api/websites/{websiteId}/sessions/stats': {
    summary: 'Get visitor session statistics',
    description:
      'Returns aggregate session metrics for the website over the selected date range and filters.',
  },
  'GET /api/websites/{websiteId}/sessions/weekly': {
    summary: 'Get traffic by weekday and hour',
    description:
      'Returns distinct visitor counts grouped by day of the week and hour in the selected timezone and date range.',
  },
  'GET /api/websites/{websiteId}/shares': {
    summary: 'List shares for a website',
    description: 'Returns a paginated list of shares for the specified website.',
  },
  'POST /api/websites/{websiteId}/shares': {
    summary: 'Create a share for a website',
    description: 'Creates a named share for the specified website with optional parameters.',
  },
  'GET /api/websites/{websiteId}/stats': {
    summary: 'Get website summary statistics',
    description:
      'Returns pageviews, unique visitors, visits, bounces, and total time on site for the selected date range and comparison period.',
  },
  'POST /api/websites/{websiteId}/transfer': {
    summary: 'Transfer website ownership',
    description:
      'Transfers the specified website to another user or team after checking permission for the destination.',
  },
  'GET /api/websites/{websiteId}/values': {
    summary: 'List website filter values',
    description:
      'Returns available values for a website filter, including saved segments or cohorts when requested, to populate filter choices.',
  },
  'GET /api/websites/charts': {
    summary: 'Get visitor charts for websites',
    description:
      'Returns visitor totals and chart data for the requested websites the caller can view, within the selected date range.',
  },
} satisfies Partial<Record<`${Uppercase<ApiHttpMethod>} /${string}`, OperationDescription>>;
