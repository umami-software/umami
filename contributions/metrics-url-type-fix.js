// Fix for issue #3651: The metrics endpoint does not accept the url metric type
// File: src/app/api/websites/[websiteId]/metrics/route.ts

// Map 'url' to 'path' for backward compatibility (around line 39):
/*
// Map 'url' to 'path' for backward compatibility
const metricType = type === 'url' ? 'path' : type;
const filters = await getQueryFilters(query, websiteId);
*/

// Use metricType instead of type in subsequent code (around line 43):
/*
if (search) {
  filters[metricType] = `c.${search}`;
}
*/

// Use metricType in SESSION_COLUMNS check (around line 46):
/*
if (SESSION_COLUMNS.includes(metricType)) {
  const data = await getSessionMetrics(websiteId, { type: metricType, limit, offset }, filters);

  return json(data);
}
*/

// Use metricType in EVENT_COLUMNS check (around line 52):
/*
if (EVENT_COLUMNS.includes(metricType)) {
  if (metricType === 'event') {
    filters.eventType = EVENT_TYPE.customEvent;
    return json(await getEventMetrics(websiteId, { type: metricType, limit, offset }, filters));
  } else {
    return json(await getPageviewMetrics(websiteId, { type: metricType, limit, offset }, filters));
  }
}
*/