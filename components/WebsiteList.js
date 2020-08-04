import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { get } from 'lib/web';
import WebsiteChart from './WebsiteChart';
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
    <div className={styles.container}>
      {data &&
        data.websites.map(({ website_id, label }) => (
          <div key={website_id}>
            <h2>
              <Link href={`/website/${website_id}/${label}`}>
                <a>{label}</a>
              </Link>
            </h2>
            <WebsiteChart key={website_id} title={label} websiteId={website_id} />
          </div>
        ))}
    </div>
  );
}
