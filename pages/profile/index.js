import Settings from 'components/pages/Settings';
import ProfileSettings from 'components/pages/ProfileSettings';
import useUser from 'hooks/useUser';

export default function TeamsPage() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <Settings>
      <ProfileSettings />
    </Settings>
  );
}
