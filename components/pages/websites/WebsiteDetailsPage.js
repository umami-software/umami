import { Loading } from 'react-basics';
import Page from 'components/layout/Page';
import WebsiteChart from 'components/pages/websites/WebsiteChart';
import FilterTags from 'components/metrics/FilterTags';
import usePageQuery from 'hooks/usePageQuery';
import WebsiteTableView from './WebsiteTableView';
import WebsiteMenuView from './WebsiteMenuView';
import { useWebsite } from 'hooks';
import WebsiteHeader from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';

export default function WebsiteDetailsPage({ websiteId }) {
  const { data: website, isLoading, error } = useWebsite(websiteId);

  const {
    query: { view, url, referrer, os, browser, device, country, region, city, title },
  } = usePageQuery();

  return (
    <Page loading={isLoading} error={error}>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteMetricsBar websiteId={websiteId} sticky={true} />
      <WebsiteChart websiteId={websiteId} />
      <FilterTags
        websiteId={websiteId}
        params={{ url, referrer, os, browser, device, country, region, city, title }}
      />
      {!website && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {website && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} />}
          {view && <WebsiteMenuView websiteId={websiteId} />}
        </>
      )}
    </Page>
  );
}
