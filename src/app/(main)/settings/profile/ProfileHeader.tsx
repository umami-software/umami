import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function ProfileHeader() {
  const { t, labels } = useMessages();

  return <SectionHeader title={t(labels.profile)}></SectionHeader>;
}
