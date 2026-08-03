import type { Metadata } from 'next';
import { BillingsPage } from './BillingsPage';

export default function () {
  return <BillingsPage />;
}

export const metadata: Metadata = {
  title: 'Billing',
};
