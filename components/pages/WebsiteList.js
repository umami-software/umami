import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import Button from 'components/common/Button';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

export default function WebsiteList({ userId }) {
  const router = useRouter();
  const { data } = useFetch('/api/websites', { user_id: userId });

  if (!data) {
    return null;
  }

  return (
    <Page>
      {data.map(({ website_id, name }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteChart websiteId={website_id} title={name} showLink />
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
          <Button icon={<Arrow />} size="medium" onClick={() => router.push('/settings')}>
            <FormattedMessage id="message.go-to-settings" defaultMessage="Go to settings" />
          </Button>
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
