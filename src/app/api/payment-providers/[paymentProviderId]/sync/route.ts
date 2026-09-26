import { NextResponse } from 'next/server';
import {
  PaymentProviderNotFoundError,
  PaymentProviderSyncAlreadyRunningError,
  syncPaymentProviderInvoices,
} from '@/lib/paymentProvider';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentProviderId: string }> },
) {
  const { paymentProviderId } = await params;
  const { mode: rawMode } = await request.json();
  const mode = rawMode === 'full' ? 'full' : 'batch';

  try {
    const result = await syncPaymentProviderInvoices(paymentProviderId, mode);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PaymentProviderNotFoundError) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (err instanceof PaymentProviderSyncAlreadyRunningError) {
      return NextResponse.json({ skipped: true, reason: 'already running' }, { status: 409 });
    }

    throw err;
  }
}
