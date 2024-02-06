'use client';
import UserSettings from './UserSettings';

export default function ({ userId }: { userId: string }) {
  return <UserSettings userId={userId} />;
}
