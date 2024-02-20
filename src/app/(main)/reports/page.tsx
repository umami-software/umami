import ReportsPage from './ReportsPage';
import { Metadata } from 'next';

export default function ({ params: { teamId } }: { params: { teamId: string } }) {
  return <ReportsPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Reports',
};
