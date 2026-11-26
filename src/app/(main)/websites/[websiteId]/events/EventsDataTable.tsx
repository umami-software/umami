import { Column, Tabs, TabsList, TabsTrigger } from '@umami/react-zen';
import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useMessages, useWebsiteEventsQuery } from '@/components/hooks';
import { EventsTable } from './EventsTable';

export function EventsDataTable({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const [view, setView] = useState('all');
  const query = useWebsiteEventsQuery(websiteId, { view });

  const tabs = [
    { id: 'all', label: t(labels.all) },
    { id: 'views', label: t(labels.views) },
    { id: 'events', label: t(labels.events) },
  ];

  return (
    <Column gap="3" minWidth="0">
      <Tabs value={view} onValueChange={value => setView(String(value))}>
        <TabsList>
          {tabs.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
        {({ data }) => <EventsTable data={data} />}
      </DataGrid>
    </Column>
  );
}
