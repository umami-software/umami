import AppLayout from 'components/layout/AppLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';
import useUser from 'hooks/useUser';

export default function TeamsPage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <TeamsList />
    </AppLayout>
  );
}
