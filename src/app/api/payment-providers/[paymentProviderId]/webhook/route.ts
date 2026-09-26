import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { decrypt, secret } from '@/lib/crypto';
import { getPaymentProviderById } from '@/queries/prisma';
import { upsertInvoiceBatch } from '@/queries/sql';

const HANDLED_EVENTS = new Set([
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.updated',
  'invoice.voided',
  'invoice.marked_uncollectible',
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentProviderId: string }> },
) {
  console.log('Webhook received');

  const { paymentProviderId } = await params;
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  const paymentProvider = await getPaymentProviderById(paymentProviderId);

  if (!paymentProvider?.webhookSecret) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const webhookSecret = decrypt(paymentProvider.webhookSecret, secret());

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    const invoiceId = (event.data.object as Stripe.Invoice).id;
    const rawApiKey = decrypt(paymentProvider.apiKey, secret());
    const stripe = new Stripe(rawApiKey, { apiVersion: '2026-02-25.clover' });
    // Expanded price isn't available in webhook events, so we need to fetch the invoice again to get the expanded price details.
    const expanded = await stripe.invoices.retrieve(invoiceId, {
      expand: ['lines.data.pricing.price_details.price'],
    });
    await upsertInvoiceBatch([expanded], paymentProviderId);
  }

  return NextResponse.json({ received: true });
}
