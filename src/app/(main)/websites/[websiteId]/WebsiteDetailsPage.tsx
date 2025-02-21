'use client';
import { usePathname } from 'next/navigation';
import FilterTags from '@/components/metrics/FilterTags';
import { useNavigation } from '@/components/hooks';
import WebsiteChart from './WebsiteChart';
import WebsiteExpandedView from './WebsiteExpandedView';
import WebsiteHeader from './WebsiteHeader';
import WebsiteMetricsBar from './WebsiteMetricsBar';
import WebsiteTableView from './WebsiteTableView';
import { FILTER_COLUMNS } from '@/lib/constants';

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
      <WebsiteMetricsBar websiteId={websiteId} showFilter={true} showChange={true} sticky={true} />
      <WebsiteChart websiteId={websiteId} />
      {!view && <WebsiteTableView websiteId={websiteId} />}
      {view && <WebsiteExpandedView websiteId={websiteId} />}
    </>
  );
}
