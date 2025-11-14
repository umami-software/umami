import { useState } from 'react';
import { useMessages, useWebsiteEventsQuery } from '@/components/hooks';
import { EventsTable } from './EventsTable';
import { DataGrid } from '@/components/common/DataGrid';
import { ReactNode } from 'react';
import { FilterButtons } from '@/components/input/FilterButtons';

export function EventsDataTable({
  websiteId,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const [view, setView] = useState('all');
  const query = useWebsiteEventsQuery(websiteId, { view });

  const buttons = [
    {
      id: 'all',
      label: formatMessage(labels.all),
    },
    {
      id: 'views',
      label: formatMessage(labels.views),
    },
    {
      id: 'events',
      label: formatMessage(labels.events),
    },
  ];

  const renderActions = () => {
    return <FilterButtons items={buttons} value={view} onChange={setView} />;
  };

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
