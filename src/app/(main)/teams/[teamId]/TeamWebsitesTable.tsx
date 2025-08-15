import { DataColumn, DataTable } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import Link from 'next/link';

export function TeamWebsitesTable({ teamId, data = [] }: { teamId: string; data: any[] }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => <Link href={`/teams/${teamId}/websites/${row.id}`}>{row.name}</Link>}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      <DataColumn id="createdBy" label={formatMessage(labels.createdBy)}>
        {(row: any) => row?.createUser?.username}
      </DataColumn>
    </DataTable>
  );
}
