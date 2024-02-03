import UserSettings from './UserSettings';

export default function ({ params: { userId } }) {
  return <UserSettings userId={userId} />;
}
