import AppLayout from 'components/layout/AppLayout';
import TeamSettings from 'components/pages/settings/teams/TeamSettings';
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
      <TeamSettings teamId={id} />
    </AppLayout>
  );
}
