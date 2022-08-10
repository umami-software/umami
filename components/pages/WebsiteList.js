import { defineMessages, useIntl } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';
import useDashboard from 'store/dashboard';
import { sortArrayByMap } from 'lib/array';
import { useMemo } from 'react';

const messages = defineMessages({
  noWebsites: {
    id: 'message.no-websites-configured',
    defaultMessage: "You don't have any websites configured.",
  },
  goToSettngs: {
    id: 'message.go-to-settings',
    defaultMessage: 'Go to settings',
  },
});

export default function WebsiteList({ websites, showCharts, limit }) {
  const { websiteOrder } = useDashboard();
  const { formatMessage } = useIntl();

  console.log({ websiteOrder });

  const ordered = useMemo(
    () => sortArrayByMap(websites, websiteOrder, 'website_id'),
    [websites, websiteOrder],
  );

  if (websites.length === 0) {
    return (
      <Page>
        <EmptyPlaceholder msg={formatMessage(messages.noWebsites)}>
          <Link href="/settings" icon={<Arrow />} iconRight>
            {formatMessage(messages.goToSettngs)}
          </Link>
        </EmptyPlaceholder>
      </Page>
    );
  }

  return (
    <div>
      {ordered.map(({ website_id, name, domain }, index) =>
        index < limit ? (
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
    </div>
  );
}
