import Dashboard from 'app/(app)/dashboard/Dashboard';
import { Metadata } from 'next';

export default function DashboardPage() {
  return <Dashboard />;
}

export const metadata: Metadata = {
  title: 'Dashboard | umami',
};
