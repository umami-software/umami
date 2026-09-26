import type { Metadata } from 'next';
import { PaymentProviderPage } from './PaymentProviderPage';

export default async function ({
  params,
}: {
  params: Promise<{ paymentProviderId: string }>;
}) {
  const { paymentProviderId } = await params;

  return <PaymentProviderPage paymentProviderId={paymentProviderId} />;
}

export const metadata: Metadata = {
  title: 'Payment Provider',
};
