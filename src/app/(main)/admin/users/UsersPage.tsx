'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { UserAddButton } from './UserAddButton';
import { UsersDataTable } from './UsersDataTable';

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
