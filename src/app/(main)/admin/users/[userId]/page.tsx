import { UserPage } from './UserPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return <UserPage userId={userId} />;
}

export const metadata: Metadata = {
  title: 'User',
};
