import UserSettings from './UserSettings';

export default function ({ params }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <UserSettings userId={params.id} />;
}
