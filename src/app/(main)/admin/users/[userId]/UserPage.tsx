'use client';
import { UserSettings } from './UserSettings';
import { UserProvider } from './UserProvider';

export function UserPage({ userId }: { userId: string }) {
  return (
    <UserProvider userId={userId}>
      <UserSettings userId={userId} />
    </UserProvider>
  );
}
