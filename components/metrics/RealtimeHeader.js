import React from 'react';
import { FormattedMessage } from 'react-intl';
import PageHeader from '../layout/PageHeader';
import DropDown from '../common/DropDown';
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
        <DropDown value={websiteId} options={options} onChange={onSelect} />
      </PageHeader>
      <div className={styles.metrics}>
        <MetricCard
          label={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
          value={pageviews.length}
        />
        <MetricCard
          label={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
          value={sessions.length}
        />
        <MetricCard
          label={<FormattedMessage id="metrics.events" defaultMessage="Events" />}
          value={events.length}
        />
        <MetricCard
          label={<FormattedMessage id="metrics.countries" defaultMessage="Countries" />}
          value={countries.length}
        />
      </div>
    </>
  );
}
