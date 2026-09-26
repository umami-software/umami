import type { Metadata } from 'next';
import { PaymentProvidersPage } from './PaymentProvidersPage';

export default function () {
  return <PaymentProvidersPage />;
}

export const metadata: Metadata = {
  title: 'Payment Providers',
};
