import { useMemo } from 'react';
import { Row, Column } from 'react-basics';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import WebsiteHeader from './WebsiteHeader';
import DateFilter from 'components/common/DateFilter';
import StickyHeader from 'components/helpers/StickyHeader';
import ErrorMessage from 'components/common/ErrorMessage';
import FilterTags from 'components/metrics/FilterTags';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import usePageQuery from 'hooks/usePageQuery';
import { getDateArray, getDateLength, getDateRangeValues } from 'lib/date';
import useApi from 'hooks/useApi';
import styles from './WebsiteChart.module.css';

export default function WebsiteChart({
  websiteId,
  title,
  domain,
  stickyHeader = false,
  showChart = true,
  onDataLoad = () => {},
}) {
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;
  const [timezone] = useTimezone();
  const {
    router,
    resolve,
    query: { url, referrer, os, browser, device, country },
  } = usePageQuery();
  const { get } = useApi();

  const { data, loading, error } = useFetch(
    `/websites/${websiteId}/pageviews`,
    {
      params: {
        start_at: +startDate,
        end_at: +endDate,
        unit,
        tz: timezone,
        url,
        referrer,
        os,
        browser,
        device,
        country,
      },
      onDataLoad,
    },
    [modified, url, referrer, os, browser, device, country],
  );

  const chartData = useMemo(() => {
    if (data) {
      return {
        pageviews: getDateArray(data.pageviews, startDate, endDate, unit),
        sessions: getDateArray(data.sessions, startDate, endDate, unit),
      };
    }
    return { pageviews: [], sessions: [] };
  }, [data, startDate, endDate, unit]);

  function handleCloseFilter(param) {
    router.push(resolve({ [param]: undefined }));
  }

  async function handleDateChange(value) {
    if (value === 'all') {
      const { data, ok } = await get(`/websites/${websiteId}`);
      if (ok) {
        setDateRange({ value, ...getDateRangeValues(new Date(data.createdAt), Date.now()) });
      }
    } else {
      setDateRange(value);
    }
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} title={title} domain={domain} />

      <StickyHeader
        className={styles.metrics}
        stickyClassName={styles.sticky}
        enabled={stickyHeader}
      >
        <FilterTags
          params={{ url, referrer, os, browser, device, country }}
          onClick={handleCloseFilter}
        />
        <Row className={styles.header}>
          <Column xs={12} sm={12} md={12} defaultSize={10}>
            <MetricsBar websiteId={websiteId} />
          </Column>
          <Column className={styles.filter} xs={12} sm={12} md={12} defaultSize={2}>
            <DateFilter
              value={value}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          </Column>
        </Row>
      </StickyHeader>
      <Row>
        <Column className={styles.chart}>
          {error && <ErrorMessage />}
          {showChart && (
            <PageviewsChart
              websiteId={websiteId}
              data={chartData}
              unit={unit}
              records={getDateLength(startDate, endDate, unit)}
              loading={loading}
            />
          )}
        </Column>
      </Row>
    </>
  );
}
