import AppLayout from 'components/layout/AppLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import { useRouter } from 'next/router';

export default function TeamDetailPage({ disabled }) {
  const router = useRouter();
  const { id } = router.query;

  if (!id || disabled) {
    return null;
  }

  return (
    <AppLayout>
      <UserSettings userId={id} />
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
