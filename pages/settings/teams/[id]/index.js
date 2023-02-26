import AppLayout from 'components/layout/AppLayout';
import TeamSettings from 'components/pages/settings/teams/TeamSettings';
import { useRouter } from 'next/router';

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <AppLayout>
      <TeamSettings teamId={id} />
    </AppLayout>
  );
}
