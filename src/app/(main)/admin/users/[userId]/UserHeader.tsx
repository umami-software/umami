import { PageHeader } from '@/components/common/PageHeader';
import { useUser } from '@/components/hooks';
import { User } from '@/components/icons';

export function UserHeader() {
  const user = useUser();

  return <PageHeader title={user?.username} icon={<User />} />;
}
