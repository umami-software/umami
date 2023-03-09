import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Button, Icon, Text, Row, Column } from 'react-basics';
import Link from 'next/link';
import PageviewsChart from './PageviewsChart';
import MetricsBar from './MetricsBar';
import WebsiteHeader from './WebsiteHeader';
import DateFilter from 'components/input/DateFilter';
import StickyHeader from 'components/common/StickyHeader';
import ErrorMessage from 'components/common/ErrorMessage';
import FilterTags from 'components/metrics/FilterTags';
import RefreshButton from 'components/input/RefreshButton';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import usePageQuery from 'hooks/usePageQuery';
import { getDateArray, getDateLength } from 'lib/date';
import Icons from 'components/icons';
import { UI_LAYOUT_BODY } from 'lib/constants';
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
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, unit, value, modified } = dateRange;
  const [timezone] = useTimezone();
  const {
    query: { url, referrer, os, browser, device, country },
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
      <FilterTags websiteId={websiteId} params={{ url, referrer, os, browser, device, country }} />
      <StickyHeader
        stickyClassName={styles.sticky}
        enabled={stickyHeader}
        scrollElement={document.getElementById(UI_LAYOUT_BODY) || document}
      >
        <Row className={styles.header}>
          <Column>
            <MetricsBar websiteId={websiteId} />
          </Column>
          <Column className={styles.actions}>
            <RefreshButton websiteId={websiteId} isLoading={isLoading} />
            <DateFilter websiteId={websiteId} value={value} className={styles.dropdown} />
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
