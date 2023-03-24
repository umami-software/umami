import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import ProfileSettings from 'components/pages/settings/profile/ProfileSettings';

export default function ProfilePage() {
  return (
    <AppLayout>
      <SettingsLayout>
        <ProfileSettings />
      </SettingsLayout>
    </AppLayout>
  );
}
