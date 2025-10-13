import { DataColumn, DataTable, DataTableProps } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { ReactNode } from 'react';

export interface TeamsTableProps extends DataTableProps {
  renderLink?: (row: any) => ReactNode;
}

export function TeamsTable({ renderLink, ...props }: TeamsTableProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {renderLink}
      </DataColumn>
      <DataColumn id="owner" label={formatMessage(labels.owner)}>
        {(row: any) => row?.members?.find(({ role }) => role === ROLES.teamOwner)?.user?.username}
      </DataColumn>
      <DataColumn id="members" label={formatMessage(labels.members)} align="end">
        {(row: any) => row?._count?.members}
      </DataColumn>
      <DataColumn id="websites" label={formatMessage(labels.websites)} align="end">
        {(row: any) => row?._count?.websites}
      </DataColumn>
    </DataTable>
  );
}
