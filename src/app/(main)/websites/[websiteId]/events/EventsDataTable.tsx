import { useWebsiteEvents } from '@/components/hooks';
import { EventsTable } from './EventsTable';
import { DataGrid } from '@/components/common/DataGrid';
import { ReactNode } from 'react';

export function EventsDataTable({
  websiteId,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useWebsiteEvents(websiteId);

  return (
    <DataGrid queryResult={queryResult} allowSearch={true} autoFocus={false}>
      {({ data }) => <EventsTable data={data} />}
    </DataGrid>
  );
}
