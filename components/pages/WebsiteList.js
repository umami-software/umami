import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

export default function WebsiteList({ userId }) {
  const { data } = useFetch('/api/websites', { params: { user_id: userId } });

  if (!data) {
    return null;
  }

  return (
    <Page>
      {data.map(({ website_id, name, domain }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteChart websiteId={website_id} title={name} domain={domain} showLink />
        </div>
      ))}
      {data.length === 0 && (
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
      )}
    </Page>
  );
}
