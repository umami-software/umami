import { defineMessages, useIntl } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';
import useDashboard from 'store/dashboard';
import { useMemo } from 'react';
import { firstBy } from 'thenby';

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

  const ordered = useMemo(
    () =>
      websites
        .map(website => ({ ...website, order: websiteOrder.indexOf(website.websiteUuid) || 0 }))
        .sort(firstBy('order')),
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
      {ordered.map(({ websiteUuid, name, domain }, index) =>
        index < limit ? (
          <div key={websiteUuid} className={styles.website}>
            <WebsiteChart
              websiteId={websiteUuid}
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
