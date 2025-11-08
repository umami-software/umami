'use client';
import { UsersDataTable } from './UsersDataTable';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { UserAddButton } from './UserAddButton';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function UsersPage() {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {};

  return (
    <Column gap="6" margin="2">
      <PageHeader title={formatMessage(labels.users)}>
        <UserAddButton onSave={handleSave} />
      </PageHeader>
      <Panel>
        <UsersDataTable />
      </Panel>
    </Column>
  );
}
