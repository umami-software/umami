'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages } from '@/components/hooks';
import { useOutboundLinkStatsQuery } from '@/components/hooks/queries/useOutboundLinkStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { getItem, setItem } from '@/lib/storage';
import { OutboundLinksDataTable } from './OutboundLinksDataTable';
import { OutboundLinksMetrics } from './OutboundLinksMetrics';

const KEY_NAME = 'umami.outbound-links.tab';

export function OutboundLinksPage({ websiteId }: { websiteId: string }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'domains');
  const { isAllTime } = useDateRange();
  const { t, labels, getErrorMessage } = useMessages();
  const { data, isLoading, isFetching, error } = useOutboundLinkStatsQuery({
    websiteId,
  });

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  const { clicks, visitors, visits, uniqueLinks, comparison } = data || {};

  const metrics = data
    ? [
        {
          value: visitors,
          label: t(labels.visitors),
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: t(labels.visits),
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          value: clicks,
          label: t(labels.outboundClicks),
          change: clicks - comparison.clicks,
          formatValue: formatLongNumber,
        },
        {
          value: uniqueLinks,
          label: t(labels.uniqueLinks),
          change: uniqueLinks - comparison.uniqueLinks,
          formatValue: formatLongNumber,
        },
      ]
    : null;

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <LoadingPanel
        data={metrics}
        isLoading={isLoading}
        isFetching={isFetching}
        error={getErrorMessage(error)}
        minHeight="136px"
      >
        <MetricsBar>
          {metrics?.map(({ label, value, change, formatValue }) => {
            return (
              <MetricCard
                key={label}
                value={value}
                label={label}
                change={change}
                formatValue={formatValue}
                showChange={!isAllTime}
              />
            );
          })}
        </MetricsBar>
      </LoadingPanel>
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={key => handleSelect(key)}>
          <TabList>
            <Tab id="domains">{t(labels.domains)}</Tab>
            <Tab id="activity">{t(labels.activity)}</Tab>
          </TabList>
          <TabPanel id="domains">
            <OutboundLinksMetrics websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="activity">
            <OutboundLinksDataTable websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Column>
  );
}
