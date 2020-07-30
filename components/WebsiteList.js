import React, { useState, useEffect } from 'react';
import { get } from 'lib/web';
import WebsiteStats from './WebsiteStats';
import DateFilter from './DateFilter';
import { getDateRange } from 'lib/date';
import styles from './WebsiteList.module.css';

export default function WebsiteList() {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange('7day'));
  const { startDate, endDate, unit } = dateRange;

  async function loadData() {
    setData(await get(`/api/website`));
  }

  function handleDateChange(value) {
    setDateRange(value);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={styles.container}>
      <DateFilter onChange={handleDateChange} />
      {data &&
        data.websites.map(({ website_id, label }) => (
          <WebsiteStats
            key={website_id}
            title={label}
            websiteId={website_id}
            startDate={startDate}
            endDate={endDate}
            unit={unit}
          />
        ))}
    </div>
  );
}
