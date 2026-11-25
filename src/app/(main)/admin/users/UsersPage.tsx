'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { UserAddButton } from './UserAddButton';
import { UsersDataTable } from './UsersDataTable';

export function UsersPage() {
  const { t, labels } = useMessages();

  const handleSave = () => {};

  return (
    <Column gap="6" margin="2">
      <PageHeader title={t(labels.users)}>
        <UserAddButton onSave={handleSave} />
      </PageHeader>
      <UsersDataTable />
    </Column>
  );
}
