// Fix for issue #3699: Prevent exporting empty datasets
// Files: src/app/api/websites/[websiteId]/export/route.ts and src/components/input/ExportButton.tsx

// Add empty dataset check in export route (around line 44):
/*
// Check if all datasets are empty
const hasData = [
  events,
  pages,
  referrers,
  browsers,
  os,
  devices,
  countries
].some(dataset => dataset && dataset.length > 0);

if (!hasData) {
  return json({ error: 'no_data' });
}
*/

// Handle no_data error in ExportButton (around line 30):
/*
// Check if there's an error indicating no data
if (response.error === 'no_data') {
  toast(formatMessage(messages.noDataAvailable));
  setIsLoading(false);
  return;
}
*/