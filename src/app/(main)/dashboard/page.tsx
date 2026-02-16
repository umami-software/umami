import type { Metadata } from 'next';
import { DashboardViewPage } from './DashboardViewPage';

export default async function () {
  return <DashboardViewPage />;
}

export const metadata: Metadata = {
  title: 'Dashboard',
};
