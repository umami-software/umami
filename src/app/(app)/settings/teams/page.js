import TeamsList from 'app/(app)/settings/teams/TeamsList';
import TeamsHeader from './TeamsHeader';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return (
    <>
      <TeamsHeader />
      <TeamsList />
    </>
  );
}
