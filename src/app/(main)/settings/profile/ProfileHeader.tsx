import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function ProfileHeader() {
  const { formatMessage, labels } = useMessages();

  return <SectionHeader title={formatMessage(labels.profile)}></SectionHeader>;
}
