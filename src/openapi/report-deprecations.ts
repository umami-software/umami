/** Keep the legacy surface discoverable until an announced breaking release. */
const calculations: Record<string, string> = {
  attribution: 'GET /api/websites/{websiteId}/attribution',
  breakdown: 'GET /api/websites/{websiteId}/breakdown',
  funnel: 'GET /api/websites/{websiteId}/funnels/stats or /funnels/{funnelId}/stats',
  goal: 'GET /api/websites/{websiteId}/goals/stats or /goals/{goalId}/stats',
  heatmap: 'GET /api/websites/{websiteId}/heatmaps',
  journey: 'GET /api/websites/{websiteId}/journeys',
  performance:
    'GET /api/websites/{websiteId}/performance/stats, /performance/chart, and /performance/metrics',
  retention: 'GET /api/websites/{websiteId}/retention',
  revenue: 'GET /api/websites/{websiteId}/revenue/stats, /revenue/chart, and /revenue/metrics',
  utm: 'GET /api/websites/{websiteId}/utm/metrics for each UTM dimension',
};

export function getReportDeprecation(method: string, path: string): string | undefined {
  const feature = path.startsWith('/api/reports/') ? path.slice('/api/reports/'.length) : '';
  const replacement = method === 'post' ? calculations[feature] : undefined;
  if (replacement) {
    return `Deprecated: use ${replacement}. The legacy request and response remain supported during migration.`;
  }
  if (
    ['/api/reports', '/api/reports/{reportId}', '/api/websites/{websiteId}/reports'].includes(path)
  ) {
    return 'Deprecated: use website-scoped /funnels or /goals resources for saved definitions. Existing IDs are preserved. Other legacy report types remain accessible here pending a persisted-data audit; no removal date has been scheduled.';
  }
}
