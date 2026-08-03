import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { decrypt, secret } from '@/lib/crypto';
import { getBillingById } from '@/queries/prisma';
import { upsertInvoiceBatch } from '@/queries/prisma/billingInvoice';

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
  { params }: { params: Promise<{ billingId: string }> },
) {
  console.log('Webhook received');

  const { billingId } = await params;
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  const billing = await getBillingById(billingId);

  if (!billing?.webhookSecret) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const webhookSecret = decrypt(billing.webhookSecret, secret());

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    const invoiceId = (event.data.object as Stripe.Invoice).id;
    const rawApiKey = decrypt(billing.apiKey, secret());
    const stripe = new Stripe(rawApiKey, { apiVersion: '2026-02-25.clover' });
    // Expanded price isn't available in webhook events, so we need to fetch the invoice again to get the expanded price details.
    const expanded = await stripe.invoices.retrieve(invoiceId, {
      expand: ['lines.data.pricing.price_details.price'],
    });
    await upsertInvoiceBatch([expanded], billingId);
  }

  return NextResponse.json({ received: true });
}
