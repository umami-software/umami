import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { differenceInMinutes } from 'date-fns';
import PageHeader from 'components/layout/PageHeader';
import DropDown from 'components/common/DropDown';
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

  const count = useMemo(() => {
    return sessions.filter(
      ({ created_at }) => differenceInMinutes(new Date(), new Date(created_at)) <= 5,
    ).length;
  }, [sessions, websiteId]);

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
        </div>
        <div>
          <ActiveUsers className={styles.active} value={count} />
        </div>
        <DropDown value={websiteId} options={options} onChange={onSelect} />
      </PageHeader>
      <div className={styles.metrics}>
        <MetricCard
          label={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
          value={pageviews.length}
          hideComparison
        />
        <MetricCard
          label={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
          value={sessions.length}
          hideComparison
        />
        <MetricCard
          label={<FormattedMessage id="metrics.events" defaultMessage="Events" />}
          value={events.length}
          hideComparison
        />
        <MetricCard
          label={<FormattedMessage id="metrics.countries" defaultMessage="Countries" />}
          value={countries.length}
          hideComparison
        />
      </div>
    </>
  );
}
