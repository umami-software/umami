import { Column, Loading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { ShoppingCart } from '@/components/icons';
import { SessionModal } from '../../sessions/SessionModal';
import { CommerceAttribution } from './CommerceAttribution';
import { CommerceCheckout } from './CommerceCheckout';
import { CommerceCustomers } from './CommerceCustomers';
import { CommerceOrderModal } from './CommerceOrderModal';
import { CommerceOverview } from './CommerceOverview';
import { CommerceProducts } from './CommerceProducts';
import { CommerceReportsToolbar } from './CommerceReportsToolbar';
import { CommerceToolbar } from './CommerceToolbar';
import { type CommerceTab, isCommerceTab } from './commerceUtils';
import { SavedCommerceReport } from './SavedCommerceReport';
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

  const reportControls = <CommerceReportsToolbar websiteId={websiteId} currency={currency} />;
  if (query.savedReport) {
    return (
      <Column gap>
        {reportControls}
        <Panel>
          <SavedCommerceReport
            key={query.savedReport}
            websiteId={websiteId}
            reportId={query.savedReport}
          />
        </Panel>
      </Column>
    );
  }

  // Nothing to report: show how to start instead of querying an empty (or missing) dataset.
  if (!hasData) {
    return (
      <Column gap>
        {reportControls}
        <Panel>
          <EmptyPlaceholder
            icon={<ShoppingCart />}
            title={t('commerce.noData')}
            description={t('commerce.noOrdersDescription')}
            minHeight="400px"
          />
        </Panel>
      </Column>
    );
  }

  const props = { websiteId, scope, startDate, endDate, unit };

  return (
    <Column gap>
      {reportControls}
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
