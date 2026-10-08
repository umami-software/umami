'use client';
import { Button, Column, Grid, Heading, Text } from '@umami/react-zen';
import Script from 'next/script';
import { useState } from 'react';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import Link from '@/components/common/Link';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useWebsiteQuery } from '@/components/hooks';
import { EventsChart } from '@/components/metrics/EventsChart';

const COMMERCE_PRODUCTS = [
  {
    productId: 'tee-classic',
    name: 'Classic Tee',
    category: 'apparel',
    variants: ['black-m', 'white-l'],
    price: 25,
  },
  {
    productId: 'hoodie-zip',
    name: 'Zip Hoodie',
    category: 'apparel',
    variants: ['grey-m', 'navy-xl'],
    price: 64,
  },
  { productId: 'cap-logo', name: 'Logo Cap', category: 'accessories', variants: [], price: 18 },
  { productId: 'mug-enamel', name: 'Enamel Mug', category: 'home', variants: [], price: 14.5 },
  {
    productId: 'sticker-pack',
    name: 'Sticker Pack',
    category: 'accessories',
    variants: [],
    price: 6,
  },
];

const COMMERCE_MARKETS = [
  { market: 'US', currency: 'USD', taxRate: 0.08 },
  { market: 'CA', currency: 'USD', taxRate: 0.13 },
  { market: 'DE', currency: 'EUR', taxRate: 0.19 },
  { market: 'FR', currency: 'EUR', taxRate: 0.2 },
];

const COMMERCE_ORDERS = 5;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const round = (n: number) => Math.round(n * 100) / 100;

export function TestConsolePage({ websiteId }: { websiteId: string }) {
  const { data } = useWebsiteQuery(websiteId);
  const [commerceRunning, setCommerceRunning] = useState(false);
  const [commerceStatus, setCommerceStatus] = useState('');

  function handleRunScript() {
    window.umami.track(props => ({
      ...props,
      url: '/page-view',
      referrer: 'https://www.google.com',
    }));
    window.umami.track('track-event-no-data');
    window.umami.track('track-event-with-data', {
      test: 'test-data',
      boolean: true,
      booleanError: 'true',
      time: new Date().toISOString(),
      user: `user${Math.round(Math.random() * 10)}`,
      number: 1,
      number2: Math.random() * 100,
      time2: new Date().toISOString(),
      nested: {
        test: 'test-data',
        number: 1,
        object: {
          test: 'test-data',
        },
      },
      array: [1, 2, 3],
    });
  }

  function handleRunRevenue() {
    window.umami.track(props => ({
      ...props,
      url: '/checkout-cart',
      referrer: 'https://www.google.com',
    }));
    window.umami.track('checkout-cart', {
      revenue: parseFloat((Math.random() * 1000).toFixed(2)),
      currency: 'USD',
    });
    window.umami.track('affiliate-link', {
      revenue: parseFloat((Math.random() * 1000).toFixed(2)),
      currency: 'USD',
    });
    window.umami.track('promotion-link', {
      revenue: parseFloat((Math.random() * 1000).toFixed(2)),
      currency: 'USD',
    });
    window.umami.track('checkout-cart', {
      revenue: parseFloat((Math.random() * 1000).toFixed(2)),
      currency: 'EUR',
    });
    window.umami.track('promotion-link', {
      revenue: parseFloat((Math.random() * 1000).toFixed(2)),
      currency: 'EUR',
    });
    window.umami.track('affiliate-link', {
      item1: {
        productIdentity: 'ABC424',
        revenue: parseFloat((Math.random() * 10000).toFixed(2)),
        currency: 'JPY',
      },
      item2: {
        productIdentity: 'ZYW684',
        revenue: parseFloat((Math.random() * 10000).toFixed(2)),
        currency: 'JPY',
      },
    });
  }

  async function recordCommerceOrder() {
    const id = crypto.randomUUID();
    const { market, currency, taxRate } = pick(COMMERCE_MARKETS);
    const items = COMMERCE_PRODUCTS.slice(0, 2).map(({ productId, name, category, price }) => ({
      productId,
      name,
      category,
      price,
      total: price,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = round(subtotal * taxRate);
    await window.umami.track('purchase', {
      commerce: {
        orderId: id,
        currency,
        market,
        total: round(subtotal + tax),
        subtotal,
        tax,
        items,
      },
    });
  }

  async function handleRunCommerce() {
    if (commerceRunning) return;
    setCommerceRunning(true);
    setCommerceStatus('Sending orders…');
    let sent = 0;
    try {
      if (!window.umami?.track) throw new Error('The tracker is not ready. Try again in a moment.');
      for (; sent < COMMERCE_ORDERS; sent++) await recordCommerceOrder();
      setCommerceStatus(`Sent ${sent} commerce orders.`);
    } catch (error) {
      console.error('Commerce order failed', error);
      setCommerceStatus(
        `Sent ${sent} of ${COMMERCE_ORDERS} orders. ${error instanceof Error ? error.message : 'Commerce collection failed.'}`,
      );
    } finally {
      setCommerceRunning(false);
    }
  }

  function handleRunIdentify() {
    window.umami.identify({
      userId: 123,
      name: 'brian',
      number: Math.random() * 100,
      test: 'test-data',
      boolean: true,
      booleanError: 'true',
      time: new Date().toISOString(),
      time2: new Date().toISOString(),
      nested: {
        test: 'test-data',
        number: 1,
        object: {
          test: 'test-data',
        },
      },
      array: [1, 2, 3],
    });
  }

  if (!data) {
    return null;
  }

  return (
    <PageBody>
      <PageHeader title="Test console">
        <Column>{data.name}</Column>
      </PageHeader>
      <Column gap="6" paddingY="6">
        <Script
          async
          data-website-id={websiteId}
          src={`${process.env.basePath || ''}/script.js`}
          data-cache="true"
          data-performance="true"
        />
        <Script
          async
          data-website-id={websiteId}
          src={`${process.env.basePath || ''}/recorder.js`}
        />
        <Panel>
          <Grid columns="1fr 1fr 1fr" gap>
            <Column gap>
              <Heading>Page links</Heading>
              <div>
                <Link href={`/console/${websiteId}?page=1`}>page one</Link>
              </div>
              <div>
                <Link href={`/console/${websiteId}?page=2 `}>page two</Link>
              </div>
              <div>
                <a href="https://www.google.com" data-umami-event="external-link-direct">
                  external link (direct)
                </a>
              </div>
              <div>
                <a
                  href="https://www.google.com"
                  data-umami-event="external-link-tab"
                  target="_blank"
                  rel="noreferrer"
                >
                  external link (tab)
                </a>
              </div>
            </Column>
            <Column gap>
              <Heading>Click events</Heading>
              <Button id="send-event-button" data-umami-event="button-click" variant="primary">
                Send event
              </Button>
              <Button
                id="send-event-data-button"
                data-umami-event="button-click"
                data-umami-event-name="bob"
                data-umami-event-id="123"
                variant="primary"
              >
                Send event with data
              </Button>
              <Button
                id="generate-revenue-button"
                data-umami-event="checkout-cart"
                data-umami-event-revenue={(Math.random() * 10000).toFixed(2).toString()}
                data-umami-event-currency="USD"
                variant="primary"
              >
                Generate revenue data
              </Button>
              <Button
                id="button-with-div-button"
                data-umami-event="button-click"
                data-umami-event-name={'bob'}
                data-umami-event-id="123"
                variant="primary"
              >
                <div>Button with div</div>
              </Button>
              <div data-umami-event="div-click">DIV with attribute</div>
              <div data-umami-event="div-click-one">
                <div data-umami-event="div-click-two">
                  <div data-umami-event="div-click-three">Nested DIV</div>
                </div>
              </div>
            </Column>
            <Column gap>
              <Heading>Javascript events</Heading>
              <Button id="manual-button" variant="primary" onClick={handleRunScript}>
                Run script
              </Button>
              <Button id="manual-button" variant="primary" onClick={handleRunIdentify}>
                Run identify
              </Button>
              <Button id="manual-button" variant="primary" onClick={handleRunRevenue}>
                Revenue script
              </Button>
              <Button
                id="commerce-button"
                variant="primary"
                onPress={handleRunCommerce}
                isDisabled={commerceRunning}
              >
                Commerce script
              </Button>
              <Text role="status" aria-live="polite">
                {commerceStatus}
              </Text>
            </Column>
          </Grid>
        </Panel>
        <Heading>Pageviews</Heading>
        <WebsiteChart websiteId={websiteId} />
        <Heading>Events</Heading>
        <Panel>
          <EventsChart websiteId={websiteId} />
        </Panel>
      </Column>
    </PageBody>
  );
}
