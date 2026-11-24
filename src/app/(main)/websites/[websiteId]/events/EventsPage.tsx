'use client';
import { Column, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { getItem, setItem } from '@/lib/storage';
import { EventProperties } from './EventProperties';
import { EventsDataTable } from './EventsDataTable';
import { EventsMetricsBar } from './EventsMetricsBar';

const KEY_NAME = 'umami.events.tab';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'chart');
  const { t, labels } = useMessages();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <Panel minWidth="0" width="100%" style={{ overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onValueChange={key => handleSelect(key)}
          style={{ minWidth: 0, width: '100%' }}
        >
          <TabsList>
            <TabsTrigger value="chart">{t(labels.chart)}</TabsTrigger>
            <TabsTrigger value="activity">{t(labels.activity)}</TabsTrigger>
            <TabsTrigger value="properties">{t(labels.properties)}</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" style={{ minWidth: 0, width: '100%' }}>
            <EventsDataTable websiteId={websiteId} />
          </TabsContent>
          <TabsContent value="chart" style={{ minWidth: 0, width: '100%' }}>
            <Column gap="6">
              <Column border="bottom" paddingBottom="6">
                <EventsChart websiteId={websiteId} limit={50} allowBarDrill={true} />
              </Column>
              <MetricsTable
                websiteId={websiteId}
                type="event"
                title={t(labels.event)}
                metric={t(labels.count)}
                limit={50}
              />
            </Column>
          </TabsContent>
          <TabsContent
            value="properties"
            style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
          >
            <EventProperties websiteId={websiteId} />
          </TabsContent>
        </Tabs>
      </Panel>
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
