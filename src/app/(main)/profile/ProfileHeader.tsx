import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export function ProfileHeader() {
  const { formatMessage, labels } = useMessages();

  return <PageHeader title={formatMessage(labels.profile)}></PageHeader>;
}

export default ProfileHeader;
