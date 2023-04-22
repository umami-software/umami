import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import TeamsList from 'components/pages/settings/teams/TeamsList';
import useMessages from 'hooks/useMessages';

export default function TeamsPage({ disabled }) {
  const { formatMessage, labels } = useMessages();
  if (disabled) {
    return null;
  }

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.teams)}`}>
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
