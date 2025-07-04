import { useState } from 'react';
import { useMessages, useWebsiteEventsQuery } from '@/components/hooks';
import { EventsTable } from './EventsTable';
import { DataGrid } from '@/components/common/DataGrid';
import { ReactNode } from 'react';
import { FilterButtons } from '@/components/common/FilterButtons';

export function EventsDataTable({
  websiteId,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const queryResult = useWebsiteEventsQuery(websiteId);
  const [view, setView] = useState('all');

  const buttons = [
    {
      id: 'all',
      label: formatMessage(labels.all),
    },
    {
      id: 'page',
      label: formatMessage(labels.page),
    },
    {
      id: 'event',
      label: formatMessage(labels.event),
    },
  ];

  const renderActions = () => {
    return <FilterButtons items={buttons} value={view} onChange={setView} />;
  };

  return (
    <DataGrid
      queryResult={queryResult}
      allowSearch={true}
      autoFocus={false}
      allowPaging={true}
      renderActions={renderActions}
    >
      {({ data }) => <EventsTable data={data} />}
    </DataGrid>
  );
}
