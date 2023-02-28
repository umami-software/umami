import AppLayout from 'components/layout/AppLayout';
import UsersList from 'components/pages/settings/users/UsersList';

export default function UsersPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <AppLayout>
      <UsersList />
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
