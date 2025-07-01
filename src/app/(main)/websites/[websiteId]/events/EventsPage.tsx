'use client';
import { TabList, Tab, Tabs, TabPanel, Column } from '@umami/react-zen';
import { EventsTable } from '@/components/metrics/EventsTable';
import { useState } from 'react';
import { EventsDataTable } from './EventsDataTable';
import { Panel } from '@/components/common/Panel';
import { EventsChart } from '@/components/metrics/EventsChart';
import { GridRow } from '@/components/common/GridRow';
import { useMessages } from '@/components/hooks';
import { EventProperties } from './EventProperties';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function EventsPage({ websiteId }) {
  const [label, setLabel] = useState(null);
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  const handleLabelClick = (value: string) => {
    setLabel(value !== label ? value : '');
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <GridRow layout="two-one">
        <Panel gridColumn="span 2">
          <EventsChart websiteId={websiteId} focusLabel={label} />
        </Panel>
        <Panel>
          <EventsTable
            websiteId={websiteId}
            type="event"
            title={formatMessage(labels.events)}
            metric={formatMessage(labels.actions)}
            onLabelClick={handleLabelClick}
          />
        </Panel>
      </GridRow>
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
          <TabList>
            <Tab id="activity">{formatMessage(labels.activity)}</Tab>
            <Tab id="properties">{formatMessage(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity">
            <EventsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="properties">
            <EventProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Column>
  );
}
