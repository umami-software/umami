import { useState } from 'react';
import { Loading } from 'react-basics';
import Page from 'components/layout/Page';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useApi from 'hooks/useApi';
import usePageQuery from 'hooks/usePageQuery';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import WebsiteTableView from './WebsiteTableView';
import WebsiteMenuView from './WebsiteMenuView';

export default function WebsiteDetails({ websiteId }) {
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['websites', websiteId], () =>
    get(`/websites/${websiteId}`),
  );
  const [chartLoaded, setChartLoaded] = useState(false);

  const {
    query: { view },
  } = usePageQuery();

  function handleDataLoad() {
    if (!chartLoaded) {
      setTimeout(() => setChartLoaded(true), DEFAULT_ANIMATION_DURATION);
    }
  }

  return (
    <Page loading={isLoading} error={error}>
      <WebsiteChart
        websiteId={websiteId}
        name={data?.name}
        domain={data?.domain}
        onDataLoad={handleDataLoad}
        showLink={false}
        stickyHeader={true}
      />
      {!chartLoaded && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {chartLoaded && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} />}
          {view && <WebsiteMenuView websiteId={websiteId} />}
        </>
      )}
    </Page>
  );
}
