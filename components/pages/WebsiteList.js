import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';
import { orderByWebsiteMap } from 'lib/format';
import { useMemo } from 'react';
import useStore from 'store/app';

const selector = state => state.dashboard;

export default function WebsiteList({ websites, showCharts, limit }) {
  const store = useStore(selector);
  const { websiteOrdering } = store;

  const ordered = useMemo(
    () => orderByWebsiteMap(websites, websiteOrdering),
    [websites, websiteOrdering],
  );

  if (websites.length === 0) {
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
