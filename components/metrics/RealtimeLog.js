import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FixedSizeList } from 'react-window';
import firstBy from 'thenby';
import { format } from 'date-fns';
import Icon from 'components/common/Icon';
import Tag from 'components/common/Tag';
import Dot from 'components/common/Dot';
import FilterButtons from 'components/common/FilterButtons';
import { devices } from 'components/messages';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { BROWSERS } from 'lib/constants';
import Bolt from 'assets/bolt.svg';
import Visitor from 'assets/visitor.svg';
import Eye from 'assets/eye.svg';
import { stringToColor } from 'lib/format';
import styles from './RealtimeLog.module.css';
import NoData from '../common/NoData';

const TYPE_ALL = 0;
const TYPE_PAGEVIEW = 1;
const TYPE_SESSION = 2;
const TYPE_EVENT = 3;

const TYPE_ICONS = {
  [TYPE_PAGEVIEW]: <Eye />,
  [TYPE_SESSION]: <Visitor />,
  [TYPE_EVENT]: <Bolt />,
};

export default function RealtimeLog({ data, websites, websiteId }) {
  const intl = useIntl();
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);
  const [filter, setFilter] = useState(TYPE_ALL);

  const logs = useMemo(() => {
    const { pageviews, sessions, events } = data;
    const logs = [...pageviews, ...sessions, ...events].sort(firstBy('created_at', -1));
    if (filter) {
      return logs.filter(row => getType(row) === filter);
    }
    return logs;
  }, [data, filter]);

  const uuids = useMemo(() => {
    return data.sessions.reduce((obj, { session_id, session_uuid }) => {
      obj[session_id] = session_uuid;
      return obj;
    }, {});
  }, [data]);

  const buttons = [
    {
      label: <FormattedMessage id="label.all" defaultMessage="All" />,
      value: TYPE_ALL,
    },
    {
      label: <FormattedMessage id="metrics.views" defaultMessage="Views" />,
      value: TYPE_PAGEVIEW,
    },
    {
      label: <FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />,
      value: TYPE_SESSION,
    },
    {
      label: <FormattedMessage id="metrics.events" defaultMessage="Events" />,
      value: TYPE_EVENT,
    },
  ];

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
    return websites.find(n => n.website_id === website_id);
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
    website_id,
  }) {
    if (event_type) {
      return (
        <div>
          <Tag>{event_type}</Tag> {event_value}
        </div>
      );
    }
    if (view_id) {
      const domain = getWebsite({ website_id })?.domain;
      return (
        <a
          className={styles.link}
          href={`//${domain}${url}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {url}
        </a>
      );
    }
    if (session_id) {
      return (
        <FormattedMessage
          id="message.log.visitor"
          defaultMessage="Visitor from {country} using {browser} on {os} {device}"
          values={{
            country: <b>{countryNames[country]}</b>,
            browser: <b>{BROWSERS[browser]}</b>,
            os: <b>{os}</b>,
            device: <b>{intl.formatMessage(devices[device])?.toLowerCase()}</b>,
          }}
        />
      );
    }
  }

  function getTime({ created_at }) {
    return format(new Date(created_at), 'h:mm:ss');
  }

  function getColor(row) {
    const { session_id } = row;

    return stringToColor(uuids[session_id] || `${session_id}${getWebsite(row)}`);
  }

  const Row = ({ index, style }) => {
    const row = logs[index];
    return (
      <div className={styles.row} style={style}>
        <div>
          <Dot color={getColor(row)} />
        </div>
        <div className={styles.time}>{getTime(row)}</div>
        <div className={styles.detail}>
          <Icon className={styles.icon} icon={getIcon(row)} />
          {getDetail(row)}
        </div>
        {!websiteId && websites.length > 1 && (
          <div className={styles.website}>{getWebsite(row)?.domain}</div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.table}>
      <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />
      <div className={styles.header}>
        <FormattedMessage id="label.realtime-logs" defaultMessage="Realtime logs" />
      </div>
      <div className={styles.body}>
        {logs?.length === 0 && <NoData />}
        <FixedSizeList height={400} itemCount={logs.length} itemSize={40}>
          {Row}
        </FixedSizeList>
      </div>
    </div>
  );
}
