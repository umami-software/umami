import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Button, Icon, Text, Row, Column, Container } from 'react-basics';
import Link from 'next/link';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import WebsiteHeader from './WebsiteHeader';
import DateFilter from 'components/common/DateFilter';
import StickyHeader from 'components/helpers/StickyHeader';
import ErrorMessage from 'components/common/ErrorMessage';
import FilterTags from 'components/metrics/FilterTags';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import usePageQuery from 'hooks/usePageQuery';
import { getDateArray, getDateLength, getDateRangeValues } from 'lib/date';
import Icons from 'components/icons';
import { labels } from 'components/messages';
import styles from './WebsiteChart.module.css';

export default function WebsiteChart({
  websiteId,
  title,
  domain,
  stickyHeader = false,
  showChart = true,
  showDetailsButton = false,
  onDataLoad = () => {},
}) {
  const { formatMessage } = useIntl();
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;
  const [timezone] = useTimezone();
  const {
    router,
    resolve,
    query: { view, url, referrer, os, browser, device, country },
  } = usePageQuery();
  const { get, useQuery } = useApi();

  const { data, isLoading, error } = useQuery(
    ['websites:pageviews', websiteId, modified, url, referrer, os, browser, device, country],
    () =>
      get(`/websites/${websiteId}/pageviews`, {
        startAt: +startDate,
        endAt: +endDate,
        unit,
        timezone,
        url,
        referrer,
        os,
        browser,
        device,
        country,
      }),
    { onSuccess: onDataLoad },
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
    if (param === null) {
      router.push(`/websites/${websiteId}/?view=${view}`);
    } else {
      router.push(resolve({ [param]: undefined }));
    }
  }

  async function handleDateChange(value) {
    if (value === 'all') {
      const data = await get(`/websites/${websiteId}`);

      if (data) {
        setDateRange({ value, ...getDateRangeValues(new Date(data.createdAt), Date.now()) });
      }
    } else {
      setDateRange(value);
    }
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} title={title} domain={domain}>
        {showDetailsButton && (
          <Link href={`/websites/${websiteId}`}>
            <a>
              <Button>
                <Text>{formatMessage(labels.viewDetails)}</Text>
                <Icon>
                  <Icons.ArrowRight />
                </Icon>
              </Button>
            </a>
          </Link>
        )}
      </WebsiteHeader>
      <FilterTags
        params={{ url, referrer, os, browser, device, country }}
        onClick={handleCloseFilter}
      />
      <StickyHeader stickyClassName={styles.sticky} enabled={stickyHeader}>
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
              loading={isLoading}
            />
          )}
        </Column>
      </Row>
    </>
  );
}
