import { NextResponse } from 'next/server';
import { getBillingProviderSyncStatuses } from '@/queries/prisma';

export async function GET() {
  const keys = await getBillingProviderSyncStatuses();
  return NextResponse.json(keys);
}
