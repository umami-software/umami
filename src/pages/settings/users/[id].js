import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import UserSettings from 'components/pages/settings/users/UserSettings';
import { useRouter } from 'next/router';
import useMessages from 'components/hooks/useMessages';

export default function ({ disabled }) {
  const router = useRouter();
  const { id } = router.query;
  const { formatMessage, labels } = useMessages();

  if (!id || disabled) {
    return null;
  }

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.users)}`}>
      <SettingsLayout>
        <UserSettings userId={id} />
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
