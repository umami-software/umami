import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { FixedSizeList } from 'react-window';
import firstBy from 'thenby';
import { format } from 'date-fns';
import Icon from 'components/common/Icon';
import Tag from 'components/common/Tag';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { BROWSERS } from 'lib/constants';
import Bolt from 'assets/bolt.svg';
import Visitor from 'assets/visitor.svg';
import Eye from 'assets/eye.svg';
import styles from './RealtimeLog.module.css';

const TYPE_PAGEVIEW = 0;
const TYPE_SESSION = 1;
const TYPE_EVENT = 2;

const TYPE_ICONS = {
  [TYPE_PAGEVIEW]: <Eye />,
  [TYPE_SESSION]: <Visitor />,
  [TYPE_EVENT]: <Bolt />,
};

export default function RealtimeLog({ data, websites }) {
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);
  const logs = useMemo(() => {
    const { pageviews, sessions, events } = data;
    return [...pageviews, ...sessions, ...events].sort(firstBy('created_at', -1));
  }, [data]);

  function getType({ view_id, session_id, event_id }) {
    if (event_id) {
      return TYPE_EVENT;
    }
    if (view_id) {
      return TYPE_PAGEVIEW;
    }
    if (session_id) {
      return TYPE_SESSION;
    }
    return null;
  }

  function getIcon(row) {
    return TYPE_ICONS[getType(row)];
  }

  function getWebsite({ website_id }) {
    return websites.find(n => n.website_id === website_id)?.name;
  }

  function getDetail({
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
    const row = logs[index];
    return (
      <div className={styles.row} style={style}>
        <div className={styles.time}>{format(new Date(row.created_at), 'h:mm:ss')}</div>
        <div className={styles.detail}>
          <Icon className={styles.icon} icon={getIcon(row)} />
          {getDetail(row)}
        </div>
        <div className={styles.website}>{getWebsite(row)}</div>
      </div>
    );
  };

  return (
    <div className={styles.table}>
      <div className={styles.header}>
        <FormattedMessage id="label.realtime-logs" defaultMessage="Realtime logs" />
      </div>
      <div className={styles.body}>
        <FixedSizeList height={400} itemCount={logs.length} itemSize={40}>
          {Row}
        </FixedSizeList>
      </div>
    </div>
  );
}
