import { Column, Loading, Tab, TabList, TabPanel, Tabs, Text } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { SessionModal } from '../../sessions/SessionModal';
import { CommerceAttribution } from './CommerceAttribution';
import { CommerceCheckout } from './CommerceCheckout';
import { CommerceCustomers } from './CommerceCustomers';
import { CommerceOrderModal } from './CommerceOrderModal';
import { CommerceOverview } from './CommerceOverview';
import { CommerceProducts } from './CommerceProducts';
import { CommerceToolbar } from './CommerceToolbar';
import { type CommerceTab, isCommerceTab } from './commerceUtils';
import { useCommerceScope } from './useCommerceScope';

export interface CommerceProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

export function Commerce({ websiteId, startDate, endDate, unit }: CommerceProps) {
  const { t, labels } = useMessages();
  const { router, updateParams, query } = useNavigation();
  const tab: CommerceTab = isCommerceTab(query.tab) ? query.tab : 'overview';
  const { currency, market, scope, currencies, hasData, isReady, setCurrency, setMarket } =
    useCommerceScope(websiteId);

  const handleTabChange = (key: CommerceTab) => {
    router.replace(
      updateParams({
        tab: key === 'overview' ? undefined : key,
        page: undefined,
        search: undefined,
        product: undefined,
      }),
      { scroll: false },
    );
  };

  if (!isReady) {
    return <Loading placement="absolute" />;
  }

  // Nothing to report: show how to start instead of querying an empty (or missing) dataset.
  if (!hasData) {
    return (
      <Panel>
        <Column gap="2" padding="6" alignItems="center">
          <Text weight="bold">{t('commerce.noData')}</Text>
          <Text color="muted">{t('commerce.noOrdersDescription')}</Text>
        </Column>
      </Panel>
    );
  }

  const props = { websiteId, scope, startDate, endDate, unit };

  return (
    <Column gap>
      <CommerceToolbar
        websiteId={websiteId}
        currency={currency}
        market={market}
        currencies={currencies}
        onCurrencyChange={setCurrency}
        onMarketChange={setMarket}
      />
      <Tabs selectedKey={tab} onSelectionChange={key => handleTabChange(key as CommerceTab)}>
        <TabList>
          <Tab id="overview">{t(labels.overview)}</Tab>
          <Tab id="products">{t('commerce.products')}</Tab>
          <Tab id="checkout">{t('commerce.checkout')}</Tab>
          <Tab id="customers">{t('commerce.customers')}</Tab>
          <Tab id="attribution">{t(labels.attribution)}</Tab>
        </TabList>
        <TabPanel id="overview">
          <CommerceOverview {...props} />
        </TabPanel>
        <TabPanel id="products">
          <CommerceProducts {...props} />
        </TabPanel>
        <TabPanel id="checkout">
          <CommerceCheckout websiteId={websiteId} scope={scope} />
        </TabPanel>
        <TabPanel id="customers">
          <CommerceCustomers websiteId={websiteId} scope={scope} />
        </TabPanel>
        <TabPanel id="attribution">
          <CommerceAttribution websiteId={websiteId} scope={scope} />
        </TabPanel>
      </Tabs>
      <SessionModal websiteId={websiteId} />
      <CommerceOrderModal websiteId={websiteId} />
    </Column>
  );
}
