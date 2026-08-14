import type { Metadata } from 'next';
import { UserSecurityPage } from './UserSecurityPage';

export default function () {
  return <UserSecurityPage />;
}

export const metadata: Metadata = {
  title: 'Security',
};
