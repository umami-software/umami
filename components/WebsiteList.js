import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import Link from './Link';
import WebsiteChart from './WebsiteChart';
import Page from './Page';
import Icon from './Icon';
import Button from './Button';
import PageHeader from './PageHeader';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

export default function WebsiteList() {
  const [data, setData] = useState();
  const router = useRouter();

  async function loadData() {
    setData(await get(`/api/website`));
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Page>
      {data &&
        data.websites.map(({ website_id, name }) => (
          <div key={website_id} className={styles.website}>
            <PageHeader>
              <Link
                href="/website/[...id]"
                as={`/website/${website_id}/${name}`}
                className={styles.title}
              >
                {name}
              </Link>
              <Button
                icon={<Arrow />}
                onClick={() =>
                  router.push('/website/[...id]', `/website/${website_id}/${name}`, {
                    shallow: true,
                  })
                }
                size="S"
              >
                <div>View details</div>
              </Button>
            </PageHeader>
            <WebsiteChart key={website_id} title={name} websiteId={website_id} />
          </div>
        ))}
    </Page>
  );
}
