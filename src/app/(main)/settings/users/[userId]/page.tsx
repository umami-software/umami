import UserPage from './UserPage';
import { Metadata } from 'next';

export default function ({ params: { userId } }) {
  return <UserPage userId={userId} />;
}

export const metadata: Metadata = {
  title: 'User Settings',
};
