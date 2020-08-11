import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import Link from './common/Link';
import WebsiteChart from './charts/WebsiteChart';
import Page from './layout/Page';
import Icon from './common/Icon';
import Button from './common/Button';
import PageHeader from './layout/PageHeader';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';
import EmptyPlaceholder from './common/EmptyPlaceholder';

export default function WebsiteList() {
  const [data, setData] = useState();
  const router = useRouter();

  async function loadData() {
    setData(await get(`/api/website`));
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
          <PageHeader>
            <div>
              <Link
                href="/website/[...id]"
                as={`/website/${website_id}/${name}`}
                className={styles.title}
              >
                {name}
              </Link>
            </div>
            <Button
              icon={<Arrow />}
              onClick={() =>
                router.push('/website/[...id]', `/website/${website_id}/${name}`, {
                  shallow: true,
                })
              }
              size="small"
            >
              <div>View details</div>
            </Button>
          </PageHeader>
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
