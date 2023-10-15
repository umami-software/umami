'use client';
import { Loading } from 'react-basics';
import { usePathname } from 'next/navigation';
import Page from 'components/layout/Page';
import FilterTags from 'components/metrics/FilterTags';
import useNavigation from 'components/hooks/useNavigation';
import { useWebsite } from 'components/hooks';
import WebsiteChart from './WebsiteChart';
import WebsiteMenuView from './WebsiteMenuView';
import WebsiteHeader from './WebsiteHeader';
import WebsiteMetricsBar from './WebsiteMetricsBar';
import WebsiteTableView from './WebsiteTableView';

export default function WebsiteDetails({ websiteId }) {
  const { data: website, isLoading, error } = useWebsite(websiteId);
  const pathname = usePathname();
  const showLinks = !pathname.includes('/share/');

  const {
    query: { view, url, referrer, os, browser, device, country, region, city, title },
  } = useNavigation();

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} showLinks={showLinks} />
      <FilterTags
        websiteId={websiteId}
        params={{ url, referrer, os, browser, device, country, region, city, title }}
      />
      <WebsiteMetricsBar websiteId={websiteId} sticky={true} />
      <WebsiteChart websiteId={websiteId} />
      {!website && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {website && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} />}
          {view && <WebsiteMenuView websiteId={websiteId} />}
        </>
      )}
    </>
  );
}
