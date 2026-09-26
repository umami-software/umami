import { DataGrid } from '@/components/common/DataGrid';
import { usePaymentProvidersQuery } from '@/components/hooks';
import { PaymentProvidersTable } from './PaymentProvidersTable';

export function PaymentProvidersDataTable() {
  const query = usePaymentProvidersQuery();

  return (
    <DataGrid query={query} allowSearch={false} allowPaging={false}>
      {({ data }) => <PaymentProvidersTable data={data} />}
    </DataGrid>
  );
}
