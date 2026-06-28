import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useReplaysQuery } from '@/components/hooks';
import { ReplayFilterButton } from './ReplayFilterButton';
import { ReplaysTable } from './ReplaysTable';

const DEFAULT_MIN_DURATION = 5;

export function ReplaysDataTable({ websiteId }: { websiteId: string }) {
  const { query } = useNavigation();
  const minDuration =
    typeof query.minDuration === 'string' && /^\d+$/.test(query.minDuration)
      ? query.minDuration
      : String(DEFAULT_MIN_DURATION);
  const queryResult = useReplaysQuery(websiteId, { minDuration });

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      renderActions={() => <ReplayFilterButton />}
    >
      {({ data }) => {
        return <ReplaysTable data={data} />;
      }}
    </DataGrid>
  );
}
