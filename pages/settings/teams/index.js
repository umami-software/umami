import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';

export default function TeamsPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <AppLayout>
      <SettingsLayout>
        <TeamsList />
      </SettingsLayout>
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
