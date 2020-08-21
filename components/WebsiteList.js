import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import WebsiteHeader from 'components/metrics/WebsiteHeader';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import Button from 'components/common/Button';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Arrow from 'assets/arrow-right.svg';
import { get } from 'lib/web';
import styles from './WebsiteList.module.css';

export default function WebsiteList() {
  const [data, setData] = useState();
  const router = useRouter();

  async function loadData() {
    setData(await get(`/api/websites`));
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Page>
      {data?.map(({ website_id, name }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteHeader websiteId={website_id} name={name} showLink />
          <WebsiteChart key={website_id} title={name} websiteId={website_id} />
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
