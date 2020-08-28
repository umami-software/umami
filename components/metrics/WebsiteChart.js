import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import QuickButtons from './QuickButtons';
import DateFilter from '../common/DateFilter';
import StickyHeader from '../helpers/StickyHeader';
import { get } from 'lib/web';
import { getDateArray, getDateRange, getTimezone } from 'lib/date';
import styles from './WebsiteChart.module.css';

export default function WebsiteChart({
  websiteId,
  defaultDateRange = '7day',
  stickyHeader = false,
  onDataLoad = () => {},
  onDateChange = () => {},
}) {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const { startDate, endDate, unit, value } = dateRange;

  const [pageviews, uniques] = useMemo(() => {
    if (data) {
      return [
        getDateArray(data.pageviews, startDate, endDate, unit),
        getDateArray(data.uniques, startDate, endDate, unit),
      ];
    }
    return [[], []];
  }, [data]);

  function handleDateChange(values) {
    setDateRange(values);
    onDateChange(values);
  }

  async function loadData() {
    const data = await get(`/api/website/${websiteId}/pageviews`, {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: getTimezone(),
    });

    setData(data);
    onDataLoad(data);
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate, unit]);

  return (
    <>
      <div className={classNames(styles.header, 'row')}>
        <StickyHeader
          className={classNames(styles.metrics, 'col row')}
          stickyClassName={styles.sticky}
          enabled={stickyHeader}
        >
          <MetricsBar
            className="col-12 col-md-9 col-lg-10"
            websiteId={websiteId}
            startDate={startDate}
            endDate={endDate}
          />
          <DateFilter
            className="col-12 col-md-3 col-lg-2"
            value={value}
            onChange={handleDateChange}
          />
        </StickyHeader>
      </div>
      <div className="row">
        <div className="col">
          <PageviewsChart websiteId={websiteId} data={{ pageviews, uniques }} unit={unit} />
          <QuickButtons value={value} onChange={handleDateChange} />
        </div>
      </div>
    </>
  );
}
