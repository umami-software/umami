import { useMemo, useState } from 'react';
import { StatusLight, Icon, Text } from 'react-basics';
import { FixedSizeList } from 'react-window';
import firstBy from 'thenby';
import FilterButtons from 'components/common/FilterButtons';
import Empty from 'components/common/Empty';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { BROWSERS } from 'lib/constants';
import { stringToColor } from 'lib/format';
import { dateFormat } from 'lib/date';
import { safeDecodeURI } from 'next-basics';
import Icons from 'components/icons';
import styles from './RealtimeLog.module.css';
import useMessages from 'hooks/useMessages';

const TYPE_ALL = 'all';
const TYPE_PAGEVIEW = 'pageview';
const TYPE_SESSION = 'session';
const TYPE_EVENT = 'event';

const icons = {
  [TYPE_PAGEVIEW]: <Icons.Eye />,
  [TYPE_SESSION]: <Icons.Visitor />,
  [TYPE_EVENT]: <Icons.Bolt />,
};

export function RealtimeLog({ data, websiteDomain }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const [filter, setFilter] = useState(TYPE_ALL);

  const buttons = [
    {
      label: formatMessage(labels.all),
      key: TYPE_ALL,
    },
    {
      label: formatMessage(labels.views),
      key: TYPE_PAGEVIEW,
    },
    {
      label: formatMessage(labels.visitors),
      key: TYPE_SESSION,
    },
    {
      label: formatMessage(labels.events),
      key: TYPE_EVENT,
    },
  ];

  const getTime = ({ createdAt }) => dateFormat(new Date(createdAt), 'pp', locale);

  const getColor = ({ sessionId }) => stringToColor(sessionId);

  const getIcon = ({ __type }) => icons[__type];

  const getDetail = log => {
    const { __type, eventName, urlPath: url, browser, os, country, device } = log;

    if (__type === TYPE_EVENT) {
      return (
        <FormattedMessage
          {...messages.eventLog}
          values={{
            event: <b>{eventName || formatMessage(labels.unknown)}</b>,
            url: (
              <a
                href={`//${websiteDomain}${url}`}
                className={styles.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                {url}
              </a>
            ),
          }}
        />
      );
    }

    if (__type === TYPE_PAGEVIEW) {
      return (
        <a
          href={`//${websiteDomain}${url}`}
          className={styles.link}
          target="_blank"
          rel="noreferrer noopener"
        >
          {safeDecodeURI(url)}
        </a>
      );
    }

    if (__type === TYPE_SESSION) {
      return (
        <FormattedMessage
          {...messages.visitorLog}
          values={{
            country: <b>{countryNames[country] || formatMessage(labels.unknown)}</b>,
            browser: <b>{BROWSERS[browser]}</b>,
            os: <b>{os}</b>,
            device: <b>{formatMessage(labels[device] || labels.unknown)}</b>,
          }}
        />
      );
    }
  };

  const Row = ({ index, style }) => {
    const row = logs[index];
    return (
      <div className={styles.row} style={style}>
        <div>
          <StatusLight color={getColor(row)} />
        </div>
        <div className={styles.time}>{getTime(row)}</div>
        <div className={styles.detail}>
          <Icon className={styles.icon}>{getIcon(row)}</Icon>
          <Text>{getDetail(row)}</Text>
        </div>
      </div>
    );
  };

  const logs = useMemo(() => {
    if (!data) {
      return [];
    }

    const { pageviews, visitors, events } = data;
    const logs = [...pageviews, ...visitors, ...events].sort(firstBy('createdAt', -1));

    if (filter !== TYPE_ALL) {
      return logs.filter(({ __type }) => __type === filter);
    }

    return logs;
  }, [data, filter]);

  return (
    <div className={styles.table}>
      <FilterButtons items={buttons} selectedKey={filter} onSelect={setFilter} />
      <div className={styles.header}>{formatMessage(labels.activityLog)}</div>
      <div className={styles.body}>
        {logs?.length === 0 && <Empty />}
        {logs?.length > 0 && (
          <FixedSizeList height={500} itemCount={logs.length} itemSize={50}>
            {Row}
          </FixedSizeList>
        )}
      </div>
    </div>
  );
}

export default RealtimeLog;
