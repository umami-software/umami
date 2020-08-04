import React, { useState, useEffect } from 'react';
import Link from './Link';
import WebsiteChart from './WebsiteChart';
import Icon from './Icon';
import { get } from 'lib/web';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';

export default function WebsiteList() {
  const [data, setData] = useState();

  async function loadData() {
    setData(await get(`/api/website`));
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {data &&
        data.websites.map(({ website_id, label }) => (
          <div key={website_id} className={styles.website}>
            <div className={styles.header}>
              <h2>
                <Link href={`/website/${website_id}/${label}`} className={styles.title}>
                  {label}
                </Link>
              </h2>
              <Link href={`/website/${website_id}/${label}`} className={styles.details}>
                <Icon icon={<Arrow />} /> View details
              </Link>
            </div>
            <WebsiteChart key={website_id} title={label} websiteId={website_id} />
          </div>
        ))}
    </>
  );
}
