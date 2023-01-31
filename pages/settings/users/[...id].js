import AppLayout from 'components/layout/AppLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import useUser from 'hooks/useUser';
import { useRouter } from 'next/router';

export default function TeamDetailPage() {
  const { user } = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <UserSettings userId={id} />
    </AppLayout>
  );
}
