import { Tabs, TabsList, TabsTrigger } from '@umami/react-zen';
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

  const renderActions = () => (
    <Tabs value={view} onValueChange={value => setView(String(value))}>
      <TabsList className="border">
        {tabs.map(({ id, label }) => (
          <TabsTrigger key={id} value={id}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      autoFocus={false}
      allowPaging={true}
      renderActions={renderActions}
    >
      {({ data }) => <EventsTable data={data} />}
    </DataGrid>
  );
}
