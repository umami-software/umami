import { CohortAddButton } from './CohortAddButton';
import { useWebsiteCohortsQuery } from '@/components/hooks';
import { CohortsTable } from './CohortsTable';
import { DataGrid } from '@/components/common/DataGrid';

export function CohortsDataTable({ websiteId }: { websiteId?: string }) {
  const query = useWebsiteCohortsQuery(websiteId, { type: 'cohort' });

  const renderActions = () => {
    return <CohortAddButton websiteId={websiteId} />;
  };

  return (
    <DataGrid
      query={query}
      allowSearch={true}
      autoFocus={false}
      allowPaging={true}
      renderActions={renderActions}
    >
      {({ data }) => <CohortsTable data={data} />}
    </DataGrid>
  );
}
