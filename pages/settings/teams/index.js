import SettingsLayout from 'components/pages/settings/SettingsLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';
import useUser from 'hooks/useUser';

export default function TeamsPage() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <SettingsLayout>
      <TeamsList />
    </SettingsLayout>
  );
}
