'use client';
import { useNavigation } from '@/components/hooks';
import FilterTags from '@/components/metrics/FilterTags';
import { FILTER_COLUMNS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import WebsiteChart from './WebsiteChart';
import WebsiteExpandedView from './WebsiteExpandedView';
import WebsiteHeader from './WebsiteHeader';
import { WebsiteMetrics } from './WebsiteMetrics';
import WebsiteMetricsBar from './WebsiteMetricsBar';
import WebsiteTableView from './WebsiteTableView';

export default function WebsiteDetailsPage({ websiteId }: { websiteId: string }) {
  const pathname = usePathname();
  const { query } = useNavigation();

  const showLinks = !pathname.includes('/share/');
  const { view } = query;

  const params = Object.keys(query).reduce((obj, key) => {
    if (FILTER_COLUMNS[key]) {
      obj[key] = query[key];
    }
    return obj;
  }, {});

  return (
    <>
      <WebsiteHeader websiteId={websiteId} showLinks={showLinks} />
      <FilterTags websiteId={websiteId} params={params} />
      <WebsiteMetrics websiteId={websiteId} showFilter={true} sticky={true}>
        <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      </WebsiteMetrics>
      <WebsiteChart websiteId={websiteId} />
      {!view && <WebsiteTableView websiteId={websiteId} />}
      {view && <WebsiteExpandedView websiteId={websiteId} />}
    </>
  );
}
