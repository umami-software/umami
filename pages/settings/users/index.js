import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import UsersList from 'components/pages/settings/users/UsersList';
import useMessages from 'hooks/useMessages';

export default function UsersPage({ disabled }) {
  const { formatMessage, labels } = useMessages();
  if (disabled) {
    return null;
  }

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.users)}`}>
      <SettingsLayout>
        <UsersList />
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
