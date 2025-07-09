'use client';
import { UsersDataTable } from './UsersDataTable';
import { Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';
import { UserAddButton } from './UserAddButton';

export function UsersPage() {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {};

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.users)}>
        <UserAddButton onSave={handleSave} />
      </SectionHeader>
      <UsersDataTable />
    </Column>
  );
}
