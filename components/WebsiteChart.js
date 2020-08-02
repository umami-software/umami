import React, { useState, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import PageviewsChart from './PageviewsChart';
import { get } from 'lib/web';
import { getDateArray, getDateRange, getTimezone } from 'lib/date';
import MetricsBar from './MetricsBar';
import QuickButtons from './QuickButtons';
import styles from './WebsiteChart.module.css';
import DateFilter from './DateFilter';
import useSticky from './hooks/useSticky';

export default function WebsiteChart({
  websiteId,
  defaultDateRange = '7day',
  stickHeader = false,
  animate = true,
  onDateChange = () => {},
}) {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const { startDate, endDate, unit, value } = dateRange;
  const [ref, sticky] = useSticky(stickHeader);
  const width = useRef();

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

  useEffect(() => {
    width.current = document.querySelector('main').offsetWidth;
  }, [sticky]);

  return (
    <>
      <div
        ref={ref}
        className={classNames(styles.header, 'row', { [styles.sticky]: sticky })}
        style={{ width: sticky ? width.current : 'auto' }}
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
      </div>
      <div className="row">
        <PageviewsChart
          className="col"
          websiteId={websiteId}
          data={{ pageviews, uniques }}
          unit={unit}
          animationDuration={animate ? 300 : 0}
        >
          <QuickButtons value={value} onChange={handleDateChange} />
        </PageviewsChart>
      </div>
    </>
  );
}
