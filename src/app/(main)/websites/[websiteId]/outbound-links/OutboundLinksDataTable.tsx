'use client';
import { DataGrid } from '@/components/common/DataGrid';
import { useOutboundLinksQuery } from '@/components/hooks';
import { OutboundLinksTable } from './OutboundLinksTable';

export function OutboundLinksDataTable({ websiteId }: { websiteId: string }) {
  const query = useOutboundLinksQuery(websiteId);

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <OutboundLinksTable data={data} />}
    </DataGrid>
  );
}
