'use client';
import { UsersDataTable } from './UsersDataTable';
import { Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { UserAddButton } from '@/app/(main)/settings/users/UserAddButton';
import { useMessages } from '@/components/hooks';

export function UsersSettingsPage() {
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
