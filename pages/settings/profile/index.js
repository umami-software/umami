import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import ProfileSettings from 'components/pages/settings/profile/ProfileSettings';
import useMessages from 'hooks/useMessages';

export default function ProfilePage() {
  const { formatMessage, labels } = useMessages();
  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.profile)}`}>
      <SettingsLayout>
        <ProfileSettings />
      </SettingsLayout>
    </AppLayout>
  );
}
