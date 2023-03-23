import { Menu, Item, Icon, Button, Flexbox, Text } from 'react-basics';
import Link from 'next/link';
import { GridRow, GridColumn } from 'components/layout/Grid';
import BrowsersTable from 'components/metrics/BrowsersTable';
import CountriesTable from 'components/metrics/CountriesTable';
import DevicesTable from 'components/metrics/DevicesTable';
import LanguagesTable from 'components/metrics/LanguagesTable';
import OSTable from 'components/metrics/OSTable';
import PagesTable from 'components/metrics/PagesTable';
import QueryParametersTable from 'components/metrics/QueryParametersTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import ScreenTable from 'components/metrics/ScreenTable';
import EventsTable from 'components/metrics/EventsTable';
import Icons from 'components/icons';
import SideNav from 'components/layout/SideNav';
import usePageQuery from 'hooks/usePageQuery';
import useMessages from 'hooks/useMessages';
import styles from './WebsiteMenuView.module.css';

const views = {
  url: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  screen: ScreenTable,
  country: CountriesTable,
  language: LanguagesTable,
  event: EventsTable,
  query: QueryParametersTable,
};

export default function WebsiteMenuView({ websiteId, websiteDomain }) {
  const { formatMessage, labels } = useMessages();
  const {
    resolveUrl,
    query: { view },
  } = usePageQuery();

  const items = [
    {
      key: 'url',
      label: formatMessage(labels.pages),
      url: resolveUrl({ view: 'url' }),
    },
    {
      key: 'referrer',
      label: formatMessage(labels.referrers),
      url: resolveUrl({ view: 'referrer' }),
    },
    {
      key: 'browser',
      label: formatMessage(labels.browsers),
      url: resolveUrl({ view: 'browser' }),
    },
    {
      key: 'os',
      label: formatMessage(labels.os),
      url: resolveUrl({ view: 'os' }),
    },
    {
      key: 'device',
      label: formatMessage(labels.devices),
      url: resolveUrl({ view: 'device' }),
    },
    {
      key: 'country',
      label: formatMessage(labels.countries),
      url: resolveUrl({ view: 'country' }),
    },
    {
      key: 'language',
      label: formatMessage(labels.languages),
      url: resolveUrl({ view: 'language' }),
    },
    {
      key: 'screen',
      label: formatMessage(labels.screens),
      url: resolveUrl({ view: 'screen' }),
    },
    {
      key: 'event',
      label: formatMessage(labels.events),
      url: resolveUrl({ view: 'event' }),
    },
    {
      key: 'query',
      label: formatMessage(labels.query),
      url: resolveUrl({ view: 'query' }),
    },
  ];

  const DetailsComponent = views[view] || (() => null);

  return (
    <GridRow>
      <GridColumn xs={12} sm={12} md={12} defaultSize={3} className={styles.menu}>
        <Link href={resolveUrl({ view: undefined })}>
          <Flexbox justifyContent="center">
            <Button variant="quiet">
              <Icon rotate={180}>
                <Icons.ArrowRight />
              </Icon>
              <Text>{formatMessage(labels.back)}</Text>
            </Button>
          </Flexbox>
        </Link>
        <SideNav items={items} selectedKey={view} shallow={true} />
      </GridColumn>
      <GridColumn xs={12} sm={12} md={12} defaultSize={9} className={styles.data}>
        <DetailsComponent
          websiteId={websiteId}
          websiteDomain={websiteDomain}
          height={500}
          limit={false}
          animate={false}
          showFilters={true}
          virtualize={true}
        />
      </GridColumn>
    </GridRow>
  );
}
