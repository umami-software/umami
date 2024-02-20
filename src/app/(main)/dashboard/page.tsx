import DashboardPage from './DashboardPage';
import { Metadata } from 'next';

export default function () {
  return <DashboardPage />;
}

export const metadata: Metadata = {
  title: 'Dashboard',
};
