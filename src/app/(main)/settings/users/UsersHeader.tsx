import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { UserAddButton } from './UserAddButton';

export function UsersHeader({ onAdd }: { onAdd?: () => void }) {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.users)}>
      <UserAddButton onSave={onAdd} />
    </PageHeader>
  );
}
