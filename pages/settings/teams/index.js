import SettingsLayout from 'components/layout/SettingsLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';

export default function TeamsPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <SettingsLayout>
      <TeamsList />
    </SettingsLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      disabled: !!process.env.CLOUD_MODE,
    },
  };
}
