import React, { useState, useEffect } from 'react';
import { get } from 'lib/web';
import WebsiteStats from './WebsiteStats';
import DateFilter from './DateFilter';
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
          <WebsiteStats key={website_id} title={label} websiteId={website_id} />
        ))}
    </div>
  );
}
