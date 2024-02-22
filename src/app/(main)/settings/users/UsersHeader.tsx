'use client';
import PageHeader from 'components/layout/PageHeader';
import useMessages from 'components/hooks/useMessages';
import UserAddButton from './UserAddButton';

export function UsersHeader({ onAdd }: { onAdd?: () => void }) {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.users)}>
      <UserAddButton onSave={onAdd} />
    </PageHeader>
  );
}

export default UsersHeader;
