import SettingsLayout from 'components/pages/settings/SettingsLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import useUser from 'hooks/useUser';
import { useRouter } from 'next/router';

export default function TeamDetailPage() {
  const user = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!user) {
    return null;
  }

  return (
    <SettingsLayout>
      <UserSettings userId={id} />
    </SettingsLayout>
  );
}
