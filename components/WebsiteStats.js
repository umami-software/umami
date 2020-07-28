import React, { useState, useEffect } from 'react';
import PageviewsChart from './PageviewsChart';
import { get } from 'lib/web';
import { getTimezone } from 'lib/date';

export default function WebsiteStats({ websiteId, startDate, endDate, unit }) {
  const [data, setData] = useState();

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/pageviews`, {
        start_at: +startDate,
        end_at: +endDate,
        unit,
        tz: getTimezone(),
      }),
    );
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate]);

  return <PageviewsChart data={data} />;
}
