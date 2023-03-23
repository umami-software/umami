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
import styles from './WebsiteChart.module.css';
import useSticky from 'hooks/useSticky';
import useMessages from 'hooks/useMessages';

export default function WebsiteChart({
  websiteId,
  title,
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
    query: { url, referrer, os, browser, device, country },
  } = usePageQuery();
  const { get, useQuery } = useApi();
  const { ref, isSticky } = useSticky({ enabled: stickyHeader });

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

  return (
    <>
      <WebsiteHeader websiteId={websiteId} title={title} domain={domain}>
        {showDetailsButton && (
          <Link href={`/websites/${websiteId}`}>
            <Button>
              <Text>{formatMessage(labels.viewDetails)}</Text>
              <Icon>
                <Icons.ArrowRight />
              </Icon>
            </Button>
          </Link>
        )}
      </WebsiteHeader>
      <FilterTags websiteId={websiteId} params={{ url, referrer, os, browser, device, country }} />
      <Row
        ref={ref}
        className={classNames(styles.header, {
          [styles.sticky]: stickyHeader,
          [styles.isSticky]: isSticky,
        })}
      >
        <Column>
          <MetricsBar websiteId={websiteId} />
        </Column>
        <Column className={styles.actions}>
          <RefreshButton websiteId={websiteId} isLoading={isLoading} />
          <DateFilter websiteId={websiteId} value={value} className={styles.dropdown} />
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
