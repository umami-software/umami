import React, { useState, useEffect, useMemo } from 'react';
import PageviewsChart from './PageviewsChart';
import { get } from 'lib/web';
import { getDateArray, getTimezone } from 'lib/date';
import WebsiteSummary from './WebsiteSummary';

export default function WebsiteStats({ websiteId, startDate, endDate, unit }) {
  const [data, setData] = useState();
  const [pageviews, uniques] = useMemo(() => {
    if (data) {
      return [
        getDateArray(data.pageviews, startDate, endDate, unit),
        getDateArray(data.uniques, startDate, endDate, unit),
      ];
    }
    return [[], []];
  }, [data]);

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
  }, [websiteId, startDate, endDate, unit]);

  return (
    <div>
      <WebsiteSummary data={{ pageviews, uniques }} />
      <PageviewsChart data={{ pageviews, uniques }} unit={unit} />
    </div>
  );
}
