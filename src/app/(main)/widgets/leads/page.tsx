import type { Metadata } from 'next';
import { LeadsPage } from './LeadsPage';

export default function () {
  return <LeadsPage />;
}

export const metadata: Metadata = {
  title: 'Leads',
};
