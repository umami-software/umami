import { SegmentAddButton } from './SegmentAddButton';
import { useWebsiteSegmentsQuery } from '@/components/hooks';
import { SegmentsTable } from './SegmentsTable';
import { DataGrid } from '@/components/common/DataGrid';

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
