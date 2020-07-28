import React, { useState, useEffect } from 'react';
import { get } from 'lib/web';
import WebsiteStats from './WebsiteStats';
import DateFilter from './DateFilter';
import { getDateRange } from '../lib/date';

export default function WebsiteList() {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange('7d'));
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
    <div>
      <DateFilter onChange={handleDateChange} />
      {data &&
        data.websites.map(({ website_id, label }) => (
          <div>
            <h2>{label}</h2>
            <WebsiteStats
              websiteId={website_id}
              startDate={startDate}
              endDate={endDate}
              unit={unit}
            />
          </div>
        ))}
    </div>
  );
}
