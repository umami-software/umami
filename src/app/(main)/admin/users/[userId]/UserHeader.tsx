import { useContext } from 'react';
import { User } from '@/components/icons';
import { PageHeader } from '@/components/common/PageHeader';
import { UserContext } from '@/app/(main)/admin/users/[userId]/UserProvider';

export function UserHeader() {
  const user = useContext(UserContext);

  return <PageHeader title={user?.username} icon={<User />} />;
}
