import classNames from 'classnames';
import { useApi, useDateRange, useMessages, usePageQuery, useSticky } from 'components/hooks';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import FilterSelectForm from 'components/pages/reports/FilterSelectForm';
import PopupForm from 'components/pages/reports/PopupForm';
import { formatShortTime } from 'lib/format';
import { Button, Column, Icon, Icons, Popup, PopupTrigger, Row } from 'react-basics';
import styles from './WebsiteMetricsBar.module.css';

export function WebsiteMetricsBar({ websiteId, showFilter = true, sticky }) {
  const { formatMessage, labels } = useMessages();

  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const {
    resolveUrl,
    router,
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = usePageQuery();

  const { data, error, isLoading, isFetched } = useQuery(
    [
      'websites:stats',
      { websiteId, modified, url, referrer, title, os, browser, device, country, region, city },
    ],
    () =>
      get(`/websites/${websiteId}/stats`, {
        startAt: +startDate,
        endAt: +endDate,
        url,
        referrer,
        title,
        os,
        browser,
        device,
        country,
        region,
        city,
      }),
  );

  const fieldOptions = [
    { name: 'url', type: 'string', label: formatMessage(labels.url) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
  ];

  const { pageviews, uniques, bounces, totaltime } = data || {};
  const num = Math.min(data && uniques.value, data && bounces.value);
  const diffs = data && {
    pageviews: pageviews.value - pageviews.change,
    uniques: uniques.value - uniques.change,
    bounces: bounces.value - bounces.change,
    totaltime: totaltime.value - totaltime.change,
  };

  const handleAddFilter = ({ name, value }) => {
    router.push(resolveUrl({ [name]: value }));
  };

  const WebsiteFilterButton = () => {
    return (
      <PopupTrigger>
        <Button>
          <Icon>
            <Icons.Plus />
          </Icon>
          {formatMessage(labels.filter)}
        </Button>
        <Popup position="bottom" alignment="start" className={styles.popup}>
          {close => {
            return (
              <PopupForm onClose={close}>
                <FilterSelectForm
                  websiteId={websiteId}
                  items={fieldOptions}
                  onSelect={value => {
                    handleAddFilter(value);
                    close();
                  }}
                  allowFilterSelect={false}
                />
              </PopupForm>
            );
          }}
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Row
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: isSticky,
      })}
    >
      <Column defaultSize={12} xl={8}>
        <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
          {!error && isFetched && (
            <>
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.views)}
                value={pageviews.value}
                change={pageviews.change}
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.visitors)}
                value={uniques.value}
                change={uniques.change}
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.bounceRate)}
                value={uniques.value ? (num / uniques.value) * 100 : 0}
                change={
                  uniques.value && uniques.change
                    ? (num / uniques.value) * 100 -
                        (Math.min(diffs.uniques, diffs.bounces) / diffs.uniques) * 100 || 0
                    : 0
                }
                format={n => Number(n).toFixed(0) + '%'}
                reverseColors
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.averageVisitTime)}
                value={
                  totaltime.value && pageviews.value
                    ? totaltime.value / (pageviews.value - bounces.value)
                    : 0
                }
                change={
                  totaltime.value && pageviews.value
                    ? (diffs.totaltime / (diffs.pageviews - diffs.bounces) -
                        totaltime.value / (pageviews.value - bounces.value)) *
                        -1 || 0
                    : 0
                }
                format={n =>
                  `${n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`
                }
              />
            </>
          )}
        </MetricsBar>
      </Column>
      <Column defaultSize={12} xl={4}>
        <div className={styles.actions}>
          {showFilter && <WebsiteFilterButton />}
          <WebsiteDateFilter websiteId={websiteId} />
        </div>
      </Column>
    </Row>
  );
}

export default WebsiteMetricsBar;
