import type { Metadata } from 'next';
import { UserPage } from './UserPage';

export default async function ({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return <UserPage userId={userId} />;
}

export const metadata: Metadata = {
  title: 'User',
};
