import { Icons, Icon, Text } from 'react-basics';
import BrowsersTable from 'components/metrics/BrowsersTable';
import CountriesTable from 'components/metrics/CountriesTable';
import RegionsTable from 'components/metrics/RegionsTable';
import CitiesTable from 'components/metrics/CitiesTable';
import DevicesTable from 'components/metrics/DevicesTable';
import LanguagesTable from 'components/metrics/LanguagesTable';
import OSTable from 'components/metrics/OSTable';
import PagesTable from 'components/metrics/PagesTable';
import QueryParametersTable from 'components/metrics/QueryParametersTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import ScreenTable from 'components/metrics/ScreenTable';
import EventsTable from 'components/metrics/EventsTable';
import SideNav from 'components/layout/SideNav';
import useNavigation from 'components/hooks/useNavigation';
import useMessages from 'components/hooks/useMessages';
import styles from './WebsiteMenuView.module.css';
import LinkButton from 'components/common/LinkButton';

const views = {
  url: PagesTable,
  title: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  screen: ScreenTable,
  country: CountriesTable,
  region: RegionsTable,
  city: CitiesTable,
  language: LanguagesTable,
  event: EventsTable,
  query: QueryParametersTable,
};

export default function WebsiteMenuView({ websiteId, websiteDomain }) {
  const { formatMessage, labels } = useMessages();
  const {
    makeUrl,
    pathname,
    query: { view },
  } = useNavigation();

  const items = [
    {
      key: 'url',
      label: formatMessage(labels.pages),
      url: makeUrl({ view: 'url' }),
    },
    {
      key: 'referrer',
      label: formatMessage(labels.referrers),
      url: makeUrl({ view: 'referrer' }),
    },
    {
      key: 'browser',
      label: formatMessage(labels.browsers),
      url: makeUrl({ view: 'browser' }),
    },
    {
      key: 'os',
      label: formatMessage(labels.os),
      url: makeUrl({ view: 'os' }),
    },
    {
      key: 'device',
      label: formatMessage(labels.devices),
      url: makeUrl({ view: 'device' }),
    },
    {
      key: 'country',
      label: formatMessage(labels.countries),
      url: makeUrl({ view: 'country' }),
    },
    {
      key: 'region',
      label: formatMessage(labels.regions),
      url: makeUrl({ view: 'region' }),
    },
    {
      key: 'city',
      label: formatMessage(labels.cities),
      url: makeUrl({ view: 'city' }),
    },
    {
      key: 'language',
      label: formatMessage(labels.languages),
      url: makeUrl({ view: 'language' }),
    },
    {
      key: 'screen',
      label: formatMessage(labels.screens),
      url: makeUrl({ view: 'screen' }),
    },
    {
      key: 'event',
      label: formatMessage(labels.events),
      url: makeUrl({ view: 'event' }),
    },
    {
      key: 'query',
      label: formatMessage(labels.queryParameters),
      url: makeUrl({ view: 'query' }),
    },
  ];

  const DetailsComponent = views[view] || (() => null);

  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        <LinkButton href={pathname} className={styles.back} variant="quiet">
          <Icon rotate={180}>
            <Icons.ArrowRight />
          </Icon>
          <Text>{formatMessage(labels.back)}</Text>
        </LinkButton>
        <SideNav items={items} selectedKey={view} shallow={true} />
      </div>
      <div className={styles.content}>
        <DetailsComponent
          websiteId={websiteId}
          websiteDomain={websiteDomain}
          limit={false}
          animate={false}
          showFilters={true}
          virtualize={true}
          itemCount={25}
        />
      </div>
    </div>
  );
}
