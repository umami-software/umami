'use client';
import { Loading } from 'react-basics';
import { usePathname } from 'next/navigation';
import Page from 'components/layout/Page';
import FilterTags from 'components/metrics/FilterTags';
import { useNavigation, useWebsite } from 'components/hooks';
import WebsiteChart from './WebsiteChart';
import WebsiteExpandedView from './WebsiteExpandedView';
import WebsiteHeader from './WebsiteHeader';
import WebsiteMetricsBar from './WebsiteMetricsBar';
import WebsiteTableView from './WebsiteTableView';

export default function WebsiteDetails({ websiteId }: { websiteId: string }) {
  const { data: website, isLoading, error } = useWebsite(websiteId);
  const pathname = usePathname();
  const { query } = useNavigation();

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  const showLinks = !pathname.includes('/share/');
  const { view, ...params } = query;

  return (
    <>
      <WebsiteHeader websiteId={websiteId} showLinks={showLinks} />
      <FilterTags websiteId={websiteId} params={params} />
      <WebsiteMetricsBar websiteId={websiteId} sticky={true} />
      <WebsiteChart websiteId={websiteId} />
      {!website && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {website && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} domainName={website.domain} />}
          {view && <WebsiteExpandedView websiteId={websiteId} domainName={website.domain} />}
        </>
      )}
    </>
  );
}
