import React from 'react';
import { FormattedMessage } from 'react-intl';
import PageHeader from '../layout/PageHeader';
import DropDown from '../common/DropDown';
import ActiveUsers from './ActiveUsers';
import MetricCard from './MetricCard';
import styles from './RealtimeHeader.module.css';

export default function RealtimeHeader({ websites, data, websiteId, onSelect }) {
  const options = [
    { label: <FormattedMessage id="label.all-websites" defaultMessage="All websites" />, value: 0 },
  ].concat(
    websites.map(({ name, website_id }, index) => ({
      label: name,
      value: website_id,
      divider: index === 0,
    })),
  );

  const { pageviews, sessions, events, countries } = data;

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
        </div>
        <div>
          <ActiveUsers className={styles.active} websiteId={websiteId} />
        </div>
        <DropDown value={websiteId} options={options} onChange={onSelect} />
      </PageHeader>
      <div className={styles.metrics}>
        <MetricCard
          label={
            <FormattedMessage
              id="metrics.views"
              defaultMessage="Views"
              values={{ x: pageviews.length }}
            />
          }
          value={pageviews.length}
          hideComparison
        />
        <MetricCard
          label={
            <FormattedMessage
              id="metrics.visitors"
              defaultMessage="Visitors"
              values={{ x: sessions.length }}
            />
          }
          value={sessions.length}
          hideComparison
        />
        <MetricCard
          label={
            <FormattedMessage
              id="metrics.events"
              defaultMessage="Events"
              values={{ x: events.length }}
            />
          }
          value={events.length}
          hideComparison
        />
        <MetricCard
          label={
            <FormattedMessage
              id="metrics.countries"
              defaultMessage="Countries"
              values={{ x: countries.length }}
            />
          }
          value={countries.length}
          hideComparison
        />
      </div>
    </>
  );
}
