import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import DashboardSettingsButton from 'components/settings/DashboardSettingsButton';
import Button from 'components/common/Button';
import useStore from 'store/app';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

const selector = state => state.dashboard;

export default function WebsiteList({ userId }) {
  const { data } = useFetch('/websites', { params: { user_id: userId } });
  const { showCharts, limit } = useStore(selector);
  const [max, setMax] = useState(limit);

  function handleMore() {
    setMax(max + limit);
  }

  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Page>
        <EmptyPlaceholder
          msg={
            <FormattedMessage
              id="message.no-websites-configured"
              defaultMessage="You don't have any websites configured."
            />
          }
        >
          <Link href="/settings" icon={<Arrow />} iconRight>
            <FormattedMessage id="message.go-to-settings" defaultMessage="Go to settings" />
          </Link>
        </EmptyPlaceholder>
      </Page>
    );
  }

  return (
    <Page>
      <div className={styles.menubar}>
        <DashboardSettingsButton />
      </div>
      {data.map(({ website_id, name, domain }, index) =>
        index < max ? (
          <div key={website_id} className={styles.website}>
            <WebsiteChart
              websiteId={website_id}
              title={name}
              domain={domain}
              showChart={showCharts}
              showLink
            />
          </div>
        ) : null,
      )}
      {max < data.length && (
        <Button className={styles.button} onClick={handleMore}>
          <FormattedMessage id="label.more" defaultMessage="More" />
        </Button>
      )}
    </Page>
  );
}
