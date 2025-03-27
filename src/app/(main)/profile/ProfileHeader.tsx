import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';

export function ProfileHeader() {
  const { formatMessage, labels } = useMessages();

  return <PageHeader title={formatMessage(labels.profile)}></PageHeader>;
}
