import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'components/common/Link';
import WebsiteChart from 'components/charts/WebsiteChart';
import Page from 'components/layout/Page';
import Button from 'components/common/Button';
import PageHeader from 'components/layout/PageHeader';
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
