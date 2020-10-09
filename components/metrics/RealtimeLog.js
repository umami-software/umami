import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import firstBy from 'thenby';
import { format } from 'date-fns';
import Table from 'components/common/Table';
import styles from './RealtimeLog.module.css';
import useLocale from '../../hooks/useLocale';
import useCountryNames from '../../hooks/useCountryNames';
import { BROWSERS } from '../../lib/constants';

export default function RealtimeLog({ data, websites }) {
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);
  const logs = useMemo(() => {
    const { pageviews, sessions, events } = data;
    return [...pageviews, ...sessions, ...events].sort(firstBy('created_at', -1));
  }, [data]);

  const columns = [
    {
      key: 'time',
      label: <FormattedMessage id="label.type" defaultMessage="Time" />,
      className: 'col',
      render: ({ created_at }) => format(new Date(created_at), 'H:mm:ss'),
    },
    {
      key: 'website',
      label: <FormattedMessage id="label.website" defaultMessage="Website" />,
      className: 'col',
      render: getWebsite,
    },
    {
      key: 'type',
      label: <FormattedMessage id="label.type" defaultMessage="Type" />,
      className: 'col',
      render: getType,
    },
    {
      key: 'type',
      className: 'col',
      render: getDescription,
    },
  ];

  function getType({ view_id, session_id, event_id }) {
    if (event_id) {
      return <FormattedMessage id="label.event" defaultMessage="Event" />;
    }
    if (view_id) {
      return <FormattedMessage id="label.pageview" defaultMessage="Pageview" />;
    }
    if (session_id) {
      return <FormattedMessage id="label.visitor" defaultMessage="Visitor" />;
    }
    return null;
  }

  function getWebsite({ website_id }) {
    return websites.find(n => n.website_id === website_id)?.name;
  }

  function getDescription({
    event_type,
    event_value,
    view_id,
    session_id,
    url,
    browser,
    os,
    country,
    device,
  }) {
    if (event_type) {
      return `${event_type}:${event_value}`;
    }
    if (view_id) {
      return url;
    }
    if (session_id) {
      return (
        <FormattedMessage
          id="message.log.visitor"
          defaultMessage="A visitor from {country} using {browser} on {os} {device}"
          values={{ country: countryNames[country], browser: BROWSERS[browser], os, device }}
        />
      );
    }
  }

  return (
    <div className={styles.log}>
      <Table className={styles.table} columns={columns} rows={logs} />
    </div>
  );
}
