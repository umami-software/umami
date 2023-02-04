import { useState } from 'react';
import { Icons, Loading } from 'react-basics';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import classNames from 'classnames';
import MenuLayout from 'components/layout/MenuLayout';
import Page from 'components/layout/Page';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useApi from 'hooks/useApi';
import usePageQuery from 'hooks/usePageQuery';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { labels, messages } from 'components/messages';
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

  const BackButton = () => (
    <div key="back-button" className={classNames(styles.backButton, 'col-12')}>
      <Link
        key="back-button"
        href={resolve({ view: undefined })}
        icon={<Icons.ArrowRight />}
        sizes="small"
      >
        {formatMessage(labels.back)}
      </Link>
    </div>
  );

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
        stickyHeader
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
