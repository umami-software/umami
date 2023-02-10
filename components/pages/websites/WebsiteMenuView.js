import { Row, Column, Menu, Item, Icon, Button } from 'react-basics';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import classNames from 'classnames';
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
import { labels } from 'components/messages';
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
  const { formatMessage } = useIntl();
  const {
    resolve,
    query: { view },
  } = usePageQuery();

  const items = [
    {
      label: formatMessage(labels.pages),
      value: resolve({ view: 'url' }),
    },
    {
      label: formatMessage(labels.referrers),
      value: resolve({ view: 'referrer' }),
    },
    {
      label: formatMessage(labels.browsers),
      value: resolve({ view: 'browser' }),
    },
    {
      label: formatMessage(labels.os),
      value: resolve({ view: 'os' }),
    },
    {
      label: formatMessage(labels.devices),
      value: resolve({ view: 'device' }),
    },
    {
      label: formatMessage(labels.countries),
      value: resolve({ view: 'country' }),
    },
    {
      label: formatMessage(labels.languages),
      value: resolve({ view: 'language' }),
    },
    {
      label: formatMessage(labels.screens),
      value: resolve({ view: 'screen' }),
    },
    {
      label: formatMessage(labels.events),
      value: resolve({ view: 'event' }),
    },
    {
      label: formatMessage(labels.query),
      value: resolve({ view: 'query' }),
    },
  ];

  const DetailsComponent = views[view];

  return (
    <Row className={styles.row}>
      <Column defaultSize={3} className={classNames(styles.col, styles.menu)}>
        <Button>
          <Icon rotate={180}>
            <Icons.ArrowRight />
          </Icon>
          {formatMessage(labels.back)}
        </Button>
        <Menu items={items}>
          {({ value, label }) => (
            <Item key={value}>
              <Link href={resolve()}>
                <a>{label}</a>
              </Link>
            </Item>
          )}
        </Menu>
      </Column>
      <Column defaultSize={9} className={styles.col}>
        <DetailsComponent
          websiteId={websiteId}
          websiteDomain={websiteDomain}
          height={500}
          limit={false}
          animate={false}
          showFilters
          virtualize
        />
      </Column>
    </Row>
  );
}
