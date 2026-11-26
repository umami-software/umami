import { useMetricsNavItems } from '@/components/hooks';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';

/** The full table for the metric selected in the sidebar. */
export function WebsiteExpandedView({ websiteId }: { websiteId: string }) {
  const { selectedKey, selectedLabel } = useMetricsNavItems();

  return <MetricsExpandedTable title={selectedLabel} type={selectedKey} websiteId={websiteId} />;
}
