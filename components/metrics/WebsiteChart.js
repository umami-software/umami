import { useMemo } from 'react';
import { Button, Icon, Text, Row, Column } from 'react-basics';
import Link from 'next/link';
import classNames from 'classnames';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import WebsiteHeader from './WebsiteHeader';
import DateFilter from 'components/input/DateFilter';
import ErrorMessage from 'components/common/ErrorMessage';
import FilterTags from 'components/metrics/FilterTags';
import RefreshButton from 'components/input/RefreshButton';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import usePageQuery from 'hooks/usePageQuery';
import { getDateArray, getDateLength } from 'lib/date';
import Icons from 'components/icons';
import useSticky from 'hooks/useSticky';
import useMessages from 'hooks/useMessages';
import styles from './WebsiteChart.module.css';
import useLocale from 'hooks/useLocale';

export function WebsiteChart({
  websiteId,
  name,
  domain,
  stickyHeader = false,
  showChart = true,
  showDetailsButton = false,
  onDataLoad = () => {},
}) {
  const { formatMessage, labels } = useMessages();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;
  const [timezone] = useTimezone();
  const {
    query: { url, referrer, os, browser, device, country, region, city, title },
  } = usePageQuery();
  const { get, useQuery } = useApi();
  const { ref, isSticky } = useSticky({ enabled: stickyHeader });

  const { data, isLoading, error } = useQuery(
    [
      'websites:pageviews',
      { websiteId, modified, url, referrer, os, browser, device, country, region, city, title },
    ],
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
        region,
        city,
        title,
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
  }, [data, modified]);

  const { dir } = useLocale();
  return (
    <>
      <WebsiteHeader websiteId={websiteId} name={name} domain={domain}>
        {showDetailsButton && (
          <Link href={`/websites/${websiteId}`}>
            <Button variant="primary">
              <Text>{formatMessage(labels.viewDetails)}</Text>
              <Icon>
                <Icon rotate={dir === 'rtl' ? 180 : 0}>
                  <Icons.ArrowRight />
                </Icon>
              </Icon>
            </Button>
          </Link>
        )}
      </WebsiteHeader>
      <FilterTags
        websiteId={websiteId}
        params={{ url, referrer, os, browser, device, country, region, city, title }}
      />
      <Row
        ref={ref}
        className={classNames(styles.header, {
          [styles.sticky]: stickyHeader,
          [styles.isSticky]: isSticky,
        })}
      >
        <Column defaultSize={12} xl={8}>
          <MetricsBar websiteId={websiteId} />
        </Column>
        <Column defaultSize={12} xl={4}>
          <div className={styles.actions}>
            <RefreshButton websiteId={websiteId} isLoading={isLoading} />
            <DateFilter websiteId={websiteId} value={value} className={styles.dropdown} />
          </div>
        </Column>
      </Row>
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

export default WebsiteChart;
