import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import QuickButtons from './QuickButtons';
import DateFilter from 'components/common/DateFilter';
import StickyHeader from 'components/helpers/StickyHeader';
import useFetch from 'hooks/useFetch';
import { getDateArray, getDateLength, getTimezone } from 'lib/date';
import { setDateRange } from 'redux/actions/websites';
import styles from './WebsiteChart.module.css';
import WebsiteHeader from './WebsiteHeader';
import { useDateRange } from '../../hooks/useDateRange';

export default function WebsiteChart({
  websiteId,
  title,
  stickyHeader = false,
  showLink = false,
  onDataLoad = () => {},
}) {
  const dispatch = useDispatch();
  const dateRange = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;

  const { data } = useFetch(
    `/api/website/${websiteId}/pageviews`,
    {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: getTimezone(),
    },
    { onDataLoad, update: [modified] },
  );

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
    dispatch(setDateRange(websiteId, values));
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} title={title} showLink={showLink} />
      <div className={classNames(styles.header, 'row')}>
        <StickyHeader
          className={classNames(styles.metrics, 'col row')}
          stickyClassName={styles.sticky}
          enabled={stickyHeader}
        >
          <MetricsBar className="col-12 col-md-9 col-lg-10" websiteId={websiteId} />
          <DateFilter
            className="col-12 col-md-3 col-lg-2"
            value={value}
            onChange={handleDateChange}
          />
        </StickyHeader>
      </div>
      <div className="row">
        <div className="col">
          <PageviewsChart
            websiteId={websiteId}
            data={{ pageviews, uniques }}
            unit={unit}
            records={getDateLength(startDate, endDate, unit)}
          />
          <QuickButtons value={value} onChange={handleDateChange} />
        </div>
      </div>
    </>
  );
}
