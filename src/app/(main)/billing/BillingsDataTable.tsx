import { DataGrid } from '@/components/common/DataGrid';
import { useBillingProvidersQuery } from '@/components/hooks';
import { BillingsTable } from './BillingsTable';

export function BillingsDataTable() {
  const query = useBillingProvidersQuery();

  return (
    <DataGrid query={query} allowSearch={false} allowPaging={false}>
      {({ data }) => <BillingsTable data={data} />}
    </DataGrid>
  );
}
