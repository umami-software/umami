import UserSettings from './UserSettings';

export default function ({ params: { userId } }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <UserSettings userId={userId} />;
}
