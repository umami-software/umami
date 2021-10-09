import Arrow from 'assets/arrow-right.svg';
import Chart from 'assets/chart-bar.svg';
import Button from 'components/common/Button';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Link from 'components/common/Link';
import Page from 'components/layout/Page';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useFetch from 'hooks/useFetch';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './WebsiteList.module.css';

export default function WebsiteList({ userId }) {
  const { data } = useFetch('/api/websites', { params: { user_id: userId } });
  const [hideCharts, setHideCharts] = useState(false);

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
        <Button icon={<Chart />} onClick={() => setHideCharts(!hideCharts)} />
      </div>
      {data?.map(({ website_id, name, domain, created_at }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteChart
            websiteId={website_id}
            title={name}
            domain={domain}
            hideChart={hideCharts}
            createdAt={created_at}
            showLink
          />
        </div>
      ))}
    </Page>
  );
}
