import { WebsitesTable } from '@/app/(main)/websites/WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useTimezone, useUserWebsitesQuery } from '@/components/hooks';

export function UserWebsites({ userId }) {
  const { timezone, canonicalizeTimezone } = useTimezone();
  const queryResult = useUserWebsitesQuery(
    { userId },
    { timezone: canonicalizeTimezone(timezone) },
  );

  return (
    <DataGrid query={queryResult}>
      {({ data }) => <WebsitesTable data={data} showActions />}
    </DataGrid>
  );
}
