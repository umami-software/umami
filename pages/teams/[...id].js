import Settings from 'components/pages/Settings';
import TeamDetails from 'components/pages/TeamDetails';
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
    <Settings>
      <TeamDetails teamId={id} />
    </Settings>
  );
}
