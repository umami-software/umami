import { useWebsiteEvents } from 'components/hooks';
import EventsTable from './EventsTable';
import DataTable from 'components/common/DataTable';
import { ReactNode } from 'react';

export default function EventsDataTable({
  websiteId,
  children,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useWebsiteEvents(websiteId);

  if (queryResult?.result?.data?.length === 0) {
    return children;
  }

  return (
    <DataTable queryResult={queryResult} allowSearch={false}>
      {({ data }) => <EventsTable data={data} />}
    </DataTable>
  );
}
