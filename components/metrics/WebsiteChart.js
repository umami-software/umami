import React, { useMemo } from 'react';
import classNames from 'classnames';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import WebsiteHeader from './WebsiteHeader';
import DateFilter from 'components/common/DateFilter';
import StickyHeader from 'components/helpers/StickyHeader';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import { getDateArray, getDateLength } from 'lib/date';
import styles from './WebsiteChart.module.css';

export default function WebsiteChart({
  websiteId,
  token,
  title,
  stickyHeader = false,
  showLink = false,
  onDataLoad = () => {},
}) {
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;
  const [timezone] = useTimezone();

  const { data, loading } = useFetch(
    `/api/website/${websiteId}/pageviews`,
    {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: timezone,
      token,
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

  return (
    <>
      <WebsiteHeader websiteId={websiteId} token={token} title={title} showLink={showLink} />
      <div className={classNames(styles.header, 'row')}>
        <StickyHeader
          className={classNames(styles.metrics, 'col row')}
          stickyClassName={styles.sticky}
          enabled={stickyHeader}
        >
          <div className="col-12 col-lg-9">
            <MetricsBar websiteId={websiteId} token={token} />
          </div>
          <div className={classNames(styles.filter, 'col-12 col-lg-3')}>
            <DateFilter
              value={value}
              startDate={startDate}
              endDate={endDate}
              onChange={setDateRange}
            />
          </div>
        </StickyHeader>
      </div>
      <div className="row">
        <div className="col">
          <PageviewsChart
            websiteId={websiteId}
            data={{ pageviews, uniques }}
            unit={unit}
            records={getDateLength(startDate, endDate, unit)}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
