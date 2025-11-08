import { Metadata } from 'next';
import { AdminTeamsPage } from './AdminTeamsPage';

export default function () {
  return <AdminTeamsPage />;
}
export const metadata: Metadata = {
  title: 'Teams',
};
