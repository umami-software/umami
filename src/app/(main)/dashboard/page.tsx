import { Metadata } from 'next';
import { DashboardPage } from './DashboardPage';

export default async function () {
  return <DashboardPage />;
}

export const metadata: Metadata = {
  title: 'Dashboard',
};
