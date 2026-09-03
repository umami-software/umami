/**
 * Canonical operation IDs for routes that rely on source-inferred contracts.
 *
 * Operation IDs become method names in the generated `@umami/api-client`, so they are part of
 * the public contract. Entries here override the mechanical path-segment naming used by
 * `src/openapi/infer.ts`. Curated `contract.ts` modules set their own `operationId` directly.
 *
 * Keys are `${METHOD} ${path}` as produced by `getOperationKey`.
 */
export const OPERATION_ID_OVERRIDES: Record<string, string> = {
  // Account
  'GET /api/me/api-keys': 'getMyApiKeys',
  'POST /api/me/api-keys': 'createMyApiKey',
  'DELETE /api/me/api-keys/{keyId}': 'deleteMyApiKey',
  'POST /api/me/password': 'updateMyPassword',
  'GET /api/me/teams': 'getMyTeams',
  'GET /api/me/websites': 'getMyWebsites',

  // Auth
  'POST /api/auth/logout': 'logout',
  'POST /api/auth/sso': 'sso',
  'GET /api/auth/subscription': 'getSubscription',
  'POST /api/auth/verify': 'verify',

  // Two-factor authentication
  'GET /api/2fa/status': 'getTwoFactorStatus',
  'POST /api/2fa/setup/initiate': 'initiateTwoFactorSetup',
  'POST /api/2fa/setup/confirm': 'confirmTwoFactorSetup',
  'POST /api/2fa/setup/cancel': 'cancelTwoFactorSetup',
  'POST /api/2fa/disable': 'disableTwoFactor',
  'POST /api/2fa/verify': 'verifyTwoFactor',

  // Realtime
  'GET /api/realtime/{websiteId}': 'getRealtime',

  // Reports
  'GET /api/reports': 'getReports',
  'POST /api/reports': 'createReport',
  'GET /api/reports/{reportId}': 'getReport',
  'POST /api/reports/{reportId}': 'updateReport',
  'DELETE /api/reports/{reportId}': 'deleteReport',
  'POST /api/reports/attribution': 'runAttributionReport',
  'POST /api/reports/breakdown': 'runBreakdownReport',
  'POST /api/reports/funnel': 'runFunnelReport',
  'POST /api/reports/goal': 'runGoalReport',
  'POST /api/reports/heatmap': 'runHeatmapReport',
  'POST /api/reports/journey': 'runJourneyReport',
  'POST /api/reports/performance': 'runPerformanceReport',
  'POST /api/reports/retention': 'runRetentionReport',
  'POST /api/reports/revenue': 'runRevenueReport',
  'POST /api/reports/utm': 'runUtmReport',

  // Teams
  'POST /api/teams': 'createTeam',
  'POST /api/teams/join': 'joinTeam',
  'GET /api/teams/{teamId}': 'getTeam',
  'POST /api/teams/{teamId}': 'updateTeam',
  'DELETE /api/teams/{teamId}': 'deleteTeam',
  'GET /api/teams/{teamId}/users': 'getTeamUsers',
  'POST /api/teams/{teamId}/users': 'createTeamUser',
  'GET /api/teams/{teamId}/users/{userId}': 'getTeamUser',
  'POST /api/teams/{teamId}/users/{userId}': 'updateTeamUser',
  'DELETE /api/teams/{teamId}/users/{userId}': 'deleteTeamUser',
  'GET /api/teams/{teamId}/websites': 'getTeamWebsites',
  'GET /api/teams/{teamId}/boards': 'getTeamBoards',
  'GET /api/teams/{teamId}/links': 'getTeamLinks',
  'GET /api/teams/{teamId}/pixels': 'getTeamPixels',

  // Users
  'POST /api/users': 'createUser',
  'GET /api/users/{userId}': 'getUser',
  'POST /api/users/{userId}': 'updateUser',
  'DELETE /api/users/{userId}': 'deleteUser',
  'GET /api/users/{userId}/teams': 'getUserTeams',
  'GET /api/users/{userId}/websites': 'getUserWebsites',

  // Boards
  'POST /api/boards': 'createBoard',
  'GET /api/boards/{boardId}': 'getBoard',
  'POST /api/boards/{boardId}': 'updateBoard',
  'DELETE /api/boards/{boardId}': 'deleteBoard',
  'POST /api/boards/{boardId}/clone': 'cloneBoard',
  'GET /api/boards/{boardId}/shares': 'getBoardShares',
  'POST /api/boards/{boardId}/shares': 'createBoardShare',

  // Links
  'POST /api/links': 'createLink',
  'GET /api/links/{linkId}': 'getLink',
  'POST /api/links/{linkId}': 'updateLink',
  'DELETE /api/links/{linkId}': 'deleteLink',
  'GET /api/links/{linkId}/shares': 'getLinkShares',
  'POST /api/links/{linkId}/shares': 'createLinkShare',

  // Pixels
  'POST /api/pixels': 'createPixel',
  'GET /api/pixels/{pixelId}': 'getPixel',
  'POST /api/pixels/{pixelId}': 'updatePixel',
  'DELETE /api/pixels/{pixelId}': 'deletePixel',
  'GET /api/pixels/{pixelId}/shares': 'getPixelShares',
  'POST /api/pixels/{pixelId}/shares': 'createPixelShare',

  // Shares
  'POST /api/share': 'createShare',
  'GET /api/share/{slug}': 'getShareBySlug',
  'GET /api/share/id/{shareId}': 'getShare',
  'POST /api/share/id/{shareId}': 'updateShare',
  'DELETE /api/share/id/{shareId}': 'deleteShare',

  // Websites
  'GET /api/websites/charts': 'getWebsitesCharts',
  'GET /api/websites/{websiteId}/active': 'getWebsiteActive',
  'GET /api/websites/{websiteId}/daterange': 'getWebsiteDateRange',
  'GET /api/websites/{websiteId}/stats': 'getWebsiteStats',
  'GET /api/websites/{websiteId}/pageviews': 'getWebsitePageviews',
  'GET /api/websites/{websiteId}/metrics': 'getWebsiteMetrics',
  'GET /api/websites/{websiteId}/metrics/expanded': 'getWebsiteExpandedMetrics',
  'GET /api/websites/{websiteId}/values': 'getWebsiteValues',
  'GET /api/websites/{websiteId}/export': 'exportWebsite',
  'POST /api/websites/{websiteId}/reset': 'resetWebsite',
  'POST /api/websites/{websiteId}/transfer': 'transferWebsite',
  'GET /api/websites/{websiteId}/reports': 'getWebsiteReports',
  'GET /api/websites/{websiteId}/shares': 'getWebsiteShares',
  'POST /api/websites/{websiteId}/shares': 'createWebsiteShare',
  'GET /api/websites/{websiteId}/recorder': 'getWebsiteRecorderConfig',

  // Annotations
  'GET /api/websites/{websiteId}/annotations': 'getWebsiteAnnotations',
  'POST /api/websites/{websiteId}/annotations': 'createWebsiteAnnotation',
  'GET /api/websites/{websiteId}/annotations/{annotationId}': 'getWebsiteAnnotation',
  'POST /api/websites/{websiteId}/annotations/{annotationId}': 'updateWebsiteAnnotation',
  'DELETE /api/websites/{websiteId}/annotations/{annotationId}': 'deleteWebsiteAnnotation',

  // Segments
  'GET /api/websites/{websiteId}/segments': 'getWebsiteSegments',
  'POST /api/websites/{websiteId}/segments': 'createWebsiteSegment',
  'GET /api/websites/{websiteId}/segments/{segmentId}': 'getWebsiteSegment',
  'POST /api/websites/{websiteId}/segments/{segmentId}': 'updateWebsiteSegment',
  'DELETE /api/websites/{websiteId}/segments/{segmentId}': 'deleteWebsiteSegment',

  // Events
  'GET /api/websites/{websiteId}/events': 'getWebsiteEvents',
  'GET /api/websites/{websiteId}/events/stats': 'getWebsiteEventStats',
  'GET /api/websites/{websiteId}/events/series': 'getWebsiteEventSeries',
  'GET /api/websites/{websiteId}/event-data': 'getEventData',
  'GET /api/websites/{websiteId}/event-data/{eventId}': 'getEventDataById',
  'GET /api/websites/{websiteId}/event-data/events': 'getEventDataEvents',
  'GET /api/websites/{websiteId}/event-data/fields': 'getEventDataFields',
  'GET /api/websites/{websiteId}/event-data/properties': 'getEventDataProperties',
  'GET /api/websites/{websiteId}/event-data/stats': 'getEventDataStats',
  'GET /api/websites/{websiteId}/event-data/values': 'getEventDataValues',
  'GET /api/websites/{websiteId}/event-data-pivot': 'getEventDataPivot',
  'GET /api/websites/{websiteId}/event-data-pivot/array-series': 'getEventDataArraySeries',
  'GET /api/websites/{websiteId}/event-data-pivot/date-series': 'getEventDataDateSeries',
  'GET /api/websites/{websiteId}/event-data-pivot/numeric-series': 'getEventDataNumericSeries',
  'GET /api/websites/{websiteId}/event-data-pivot/numeric-stats': 'getEventDataNumericStats',
  'GET /api/websites/{websiteId}/event-data-pivot/property-series': 'getEventDataPropertySeries',

  // Sessions
  'GET /api/websites/{websiteId}/sessions': 'getWebsiteSessions',
  'GET /api/websites/{websiteId}/sessions/stats': 'getWebsiteSessionStats',
  'GET /api/websites/{websiteId}/sessions/weekly': 'getWebsiteSessionsWeekly',
  'GET /api/websites/{websiteId}/sessions/{sessionId}': 'getWebsiteSession',
  'DELETE /api/websites/{websiteId}/sessions/{sessionId}': 'deleteWebsiteSession',
  'GET /api/websites/{websiteId}/sessions/{sessionId}/activity': 'getWebsiteSessionActivity',
  'GET /api/websites/{websiteId}/sessions/{sessionId}/properties': 'getWebsiteSessionProperties',
  'GET /api/websites/{websiteId}/sessions/{sessionId}/replays': 'getWebsiteSessionReplays',
  'GET /api/websites/{websiteId}/session-data-pivot': 'getSessionDataPivot',
  'GET /api/websites/{websiteId}/session-data/array-series': 'getSessionDataArraySeries',
  'GET /api/websites/{websiteId}/session-data/date-series': 'getSessionDataDateSeries',
  'GET /api/websites/{websiteId}/session-data/numeric-series': 'getSessionDataNumericSeries',
  'GET /api/websites/{websiteId}/session-data/numeric-stats': 'getSessionDataNumericStats',
  'GET /api/websites/{websiteId}/session-data/properties': 'getSessionDataProperties',
  'GET /api/websites/{websiteId}/session-data/property-series': 'getSessionDataPropertySeries',
  'GET /api/websites/{websiteId}/session-data/stats': 'getSessionDataStats',
  'GET /api/websites/{websiteId}/session-data/values': 'getSessionDataValues',

  // Replays
  'GET /api/websites/{websiteId}/replays': 'getWebsiteReplays',
  'GET /api/websites/{websiteId}/replays/{replayId}': 'getWebsiteReplay',
  'GET /api/websites/{websiteId}/replays/saved': 'getWebsiteSavedReplays',
  'GET /api/websites/{websiteId}/replays/saved/{replayId}': 'getWebsiteReplaySaved',
  'POST /api/websites/{websiteId}/replays/saved/{replayId}': 'saveWebsiteReplay',

  // Revenue
  'GET /api/websites/{websiteId}/revenue/chart': 'getWebsiteRevenueChart',
  'GET /api/websites/{websiteId}/revenue/metrics': 'getWebsiteRevenueMetrics',
  'GET /api/websites/{websiteId}/revenue/sessions': 'getWebsiteRevenueSessions',
  'GET /api/websites/{websiteId}/revenue/stats': 'getWebsiteRevenueStats',

  // Collection
  'POST /api/send': 'send',
  'POST /api/batch': 'batch',
  'POST /api/record': 'record',
};

export function getOperationIdOverride(method: string, path: string) {
  return OPERATION_ID_OVERRIDES[`${method.toUpperCase()} ${path}`];
}
