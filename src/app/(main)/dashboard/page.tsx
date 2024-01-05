import Dashboard from 'app/(main)/dashboard/Dashboard';
import { Metadata } from 'next';

export default function () {
  return <Dashboard />;
}

export const metadata: Metadata = {
  title: 'Dashboard | umami',
};
