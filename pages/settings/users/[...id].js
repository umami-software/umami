import AppLayout from 'components/layout/AppLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import { useRouter } from 'next/router';

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <AppLayout>
      <UserSettings userId={id} />
    </AppLayout>
  );
}
