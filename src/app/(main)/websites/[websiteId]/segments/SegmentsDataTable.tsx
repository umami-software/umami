import { DataGrid } from '@/components/common/DataGrid';
import { useWebsiteSegmentsQuery } from '@/components/hooks';
import { SegmentAddButton } from './SegmentAddButton';
import { SegmentsTable } from './SegmentsTable';

export function SegmentsDataTable({ websiteId }: { websiteId?: string }) {
  const query = useWebsiteSegmentsQuery(websiteId, { type: 'segment' });

  const renderActions = () => {
    return <SegmentAddButton websiteId={websiteId} />;
  };

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      autoFocus={false}
      allowPaging={true}
      renderActions={renderActions}
    >
      {({ data }) => <SegmentsTable data={data} />}
    </DataGrid>
  );
}
