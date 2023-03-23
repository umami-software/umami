import SettingsLayout from 'components/layout/SettingsLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import { useRouter } from 'next/router';

export default function TeamDetailPage({ disabled }) {
  const router = useRouter();
  const { id } = router.query;

  if (!id || disabled) {
    return null;
  }

  return (
    <SettingsLayout>
      <UserSettings userId={id} />
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
