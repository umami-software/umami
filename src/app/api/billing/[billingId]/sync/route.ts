import { NextResponse } from 'next/server';
import {
  BillingNotFoundError,
  BillingSyncAlreadyRunningError,
  syncBillingInvoices,
} from '@/lib/billing';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ billingId: string }> },
) {
  const { billingId } = await params;
  const { mode: rawMode } = await request.json();
  const mode = rawMode === 'full' ? 'full' : 'batch';

  try {
    const result = await syncBillingInvoices(billingId, mode);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BillingNotFoundError) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (err instanceof BillingSyncAlreadyRunningError) {
      return NextResponse.json({ skipped: true, reason: 'already running' }, { status: 409 });
    }

    throw err;
  }
}
