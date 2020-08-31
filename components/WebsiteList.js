import React from 'react';
import { useRouter } from 'next/router';
import WebsiteHeader from 'components/metrics/WebsiteHeader';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import Button from 'components/common/Button';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

export default function WebsiteList() {
  const router = useRouter();
  const { data } = useFetch('/api/websites');

  if (!data) {
    return null;
  }

  return (
    <Page>
      {data.map(({ website_id, name }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteHeader websiteId={website_id} title={name} showLink />
          <WebsiteChart websiteId={website_id} />
        </div>
      ))}
      {data.length === 0 && (
        <EmptyPlaceholder msg={"You don't have any websites configured."}>
          <Button icon={<Arrow />} size="medium" onClick={() => router.push('/settings')}>
            <div>Go to settings</div>
          </Button>
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
