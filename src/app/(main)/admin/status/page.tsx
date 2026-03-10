import { Metadata } from 'next';
import { StatusPage } from './StatusPage';

export default async function () {
  return <StatusPage />;
}

export const metadata: Metadata = {
  title: 'System Status',
};

