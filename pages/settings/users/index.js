import SettingsLayout from 'components/layout/SettingsLayout';
import UsersList from 'components/pages/settings/users/UsersList';

export default function UsersPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <SettingsLayout>
      <UsersList />
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
