import type { Metadata } from 'next';
import { BillingsPage } from './BillingsPage';

export default async function ({ params }: { params: Promise<{ billingId: string }> }) {
  const { billingId } = await params;

  return <BillingsPage billingId={billingId} />;
}

export const metadata: Metadata = {
  title: 'Billing',
};
