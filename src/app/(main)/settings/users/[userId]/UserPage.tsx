'use client';
import UserSettings from './UserSettings';
import UserProvider from './UserProvider';

export default function ({ userId }: { userId: string }) {
  return (
    <UserProvider userId={userId}>
      <UserSettings userId={userId} />
    </UserProvider>
  );
}
