import { useState } from 'react';
import { Icons, Loading } from 'react-basics';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import classNames from 'classnames';
import Page from 'components/layout/Page';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useApi from 'hooks/useApi';
import usePageQuery from 'hooks/usePageQuery';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { labels } from 'components/messages';
import styles from './WebsiteDetails.module.css';
import WebsiteTableView from './WebsiteTableView';
import WebsiteMenuView from './WebsiteMenuView';

export default function WebsiteDetails({ websiteId }) {
  const { formatMessage } = useIntl();
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['websites', websiteId], () =>
    get(`/websites/${websiteId}`),
  );
  const [chartLoaded, setChartLoaded] = useState(false);

  const {
    resolve,
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
        title={data?.name}
        domain={data?.domain}
        onDataLoad={handleDataLoad}
        showLink={false}
        stickyHeader={true}
      />
      {!chartLoaded && <Loading icon="dots" />}
      {chartLoaded && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} />}
          {view && <WebsiteMenuView websiteId={websiteId} />}
        </>
      )}
    </Page>
  );
}
