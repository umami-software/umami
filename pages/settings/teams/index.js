import AppLayout from 'components/layout/AppLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';

export default function TeamsPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <AppLayout>
      <TeamsList />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      disabled: !!process.env.CLOUD_MODE,
    },
  };
}
