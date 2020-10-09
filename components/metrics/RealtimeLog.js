import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FixedSizeList } from 'react-window';
import firstBy from 'thenby';
import { format } from 'date-fns';
import Icon from 'components/common/Icon';
import Table, { TableRow } from 'components/common/Table';
import Tag from 'components/common/Tag';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { BROWSERS } from 'lib/constants';
import Bolt from 'assets/bolt.svg';
import Visitor from 'assets/visitor.svg';
import Eye from 'assets/eye.svg';
import styles from './RealtimeLog.module.css';

export default function RealtimeLog({ data, websites }) {
  const intl = useIntl();
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);
  const logs = useMemo(() => {
    const { pageviews, sessions, events } = data;
    return [...pageviews, ...sessions, ...events].sort(firstBy('created_at', -1));
  }, [data]);

  const columns = [
    {
      key: 'time',
      label: <FormattedMessage id="label.time" defaultMessage="Time" />,
      className: 'col-1',
      render: ({ created_at }) => format(new Date(created_at), 'H:mm:ss'),
    },
    {
      key: 'website',
      label: <FormattedMessage id="label.website" defaultMessage="Website" />,
      className: 'col-2',
      render: getWebsite,
    },
    {
      key: 'type',
      label: <FormattedMessage id="label.event" defaultMessage="Event" />,
      className: 'col-9',
      render: row => (
        <>
          <Icon className={styles.icon} icon={getIcon(row)} title={getType(row)} />
          {getDescription(row)}
        </>
      ),
    },
  ];

  function getType({ view_id, session_id, event_id }) {
    if (event_id) {
      return intl.formatMessage({ id: 'label.event', defaultMessage: 'Event' });
    }
    if (view_id) {
      return intl.formatMessage({ id: 'label.pageview', defaultMessage: 'Pageview' });
    }
    if (session_id) {
      return intl.formatMessage({ id: 'label.visitor', defaultMessage: 'Visitor' });
    }
    return null;
  }

  function getIcon({ view_id, session_id, event_id }) {
    if (event_id) {
      return <Bolt />;
    }
    if (view_id) {
      return <Eye />;
    }
    if (session_id) {
      return <Visitor />;
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
      return (
        <div>
          <Tag>{event_type}</Tag> {event_value}
        </div>
      );
    }
    if (view_id) {
      return url;
    }
    if (session_id) {
      return (
        <FormattedMessage
          id="message.log.visitor"
          defaultMessage="Visitor from {country} using {browser} on {os} {device}"
          values={{ country: countryNames[country], browser: BROWSERS[browser], os, device }}
        />
      );
    }
  }

  const Row = ({ index, style }) => {
    return (
      <div style={style}>
        <TableRow key={index} columns={columns} row={logs[index]} />
      </div>
    );
  };

  return (
    <div className={styles.log}>
      <Table className={styles.table} bodyClassName={styles.body} columns={columns} rows={logs}>
        <FixedSizeList height={600} itemCount={logs.length} itemSize={46}>
          {Row}
        </FixedSizeList>
      </Table>
    </div>
  );
}
