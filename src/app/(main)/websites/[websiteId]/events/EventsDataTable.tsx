import { useWebsiteEvents } from 'components/hooks';
import EventsTable from './EventsTable';
import DataTable from 'components/common/DataTable';
import { ReactNode } from 'react';

export default function EventsDataTable({
  websiteId,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useWebsiteEvents(websiteId);

  return (
    <DataTable queryResult={queryResult} allowSearch={true}>
      {({ data }) => <EventsTable data={data} />}
    </DataTable>
  );
}
