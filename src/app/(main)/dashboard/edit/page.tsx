import type { Metadata } from 'next';
import { DashboardEditPage } from '../DashboardEditPage';

export default function () {
  return <DashboardEditPage />;
}

export const metadata: Metadata = {
  title: 'Edit Dashboard',
};
