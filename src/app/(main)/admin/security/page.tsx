import type { Metadata } from 'next';
import { AdminSecurityPage } from './AdminSecurityPage';

export default function () {
  return <AdminSecurityPage />;
}

export const metadata: Metadata = {
  title: 'Security',
};
