import SettingsLayout from 'components/pages/settings/SettingsLayout';
import TeamDetails from 'components/pages/settings/teams/TeamDetails';
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
      <TeamDetails teamId={id} />
    </SettingsLayout>
  );
}
