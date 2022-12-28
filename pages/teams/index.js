import Settings from 'components/pages/Settings';
import TeamsList from 'components/pages/TeamsList';
import useUser from 'hooks/useUser';

export default function TeamsPage() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <Settings>
      <TeamsList />
    </Settings>
  );
}
