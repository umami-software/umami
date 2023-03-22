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
import usePageQuery from 'hooks/usePageQuery';
import Icons from 'components/icons';
import styles from './WebsiteMenuView.module.css';
import useMessages from 'hooks/useMessages';

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
    },
    {
      key: 'referrer',
      label: formatMessage(labels.referrers),
    },
    {
      key: 'browser',
      label: formatMessage(labels.browsers),
    },
    {
      key: 'os',
      label: formatMessage(labels.os),
    },
    {
      key: 'device',
      label: formatMessage(labels.devices),
    },
    {
      key: 'country',
      label: formatMessage(labels.countries),
    },
    {
      key: 'language',
      label: formatMessage(labels.languages),
    },
    {
      key: 'screen',
      label: formatMessage(labels.screens),
    },
    {
      key: 'event',
      label: formatMessage(labels.events),
    },
    {
      key: 'query',
      label: formatMessage(labels.query),
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
        <Menu items={items} selectedKey={view}>
          {({ key, label }) => (
            <Item key={key} className={styles.item}>
              <Link href={resolveUrl({ view: key })} shallow={true}>
                {label}
              </Link>
            </Item>
          )}
        </Menu>
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
