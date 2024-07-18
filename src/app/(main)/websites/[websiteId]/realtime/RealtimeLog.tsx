import { useContext, useMemo, useState } from 'react';
import { StatusLight, Icon, Text, SearchField } from 'react-basics';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns';
import thenby from 'thenby';
import { safeDecodeURI } from 'next-basics';
import FilterButtons from 'components/common/FilterButtons';
import Empty from 'components/common/Empty';
import { useLocale, useCountryNames, useMessages } from 'components/hooks';
import Icons from 'components/icons';
import useFormat from 'components//hooks/useFormat';
import { BROWSERS } from 'lib/constants';
import { stringToColor } from 'lib/format';
import { RealtimeData } from 'lib/types';
import { WebsiteContext } from '../WebsiteProvider';
import styles from './RealtimeLog.module.css';

const TYPE_ALL = 'all';
const TYPE_PAGEVIEW = 'pageview';
const TYPE_SESSION = 'session';
const TYPE_EVENT = 'event';

const icons = {
  [TYPE_PAGEVIEW]: <Icons.Eye />,
  [TYPE_SESSION]: <Icons.Visitor />,
  [TYPE_EVENT]: <Icons.Bolt />,
};

export function RealtimeLog({ data }: { data: RealtimeData }) {
  const website = useContext(WebsiteContext);
  const [search, setSearch] = useState('');
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { formatValue } = useFormat();
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

  const getTime = ({ timestamp }) => format(timestamp * 1000, 'h:mm:ss');

  const getColor = ({ id, sessionId }) => stringToColor(sessionId || id);

  const getIcon = ({ __type }) => icons[__type];

  const getDetail = (log: {
    __type: string;
    eventName: string;
    urlPath: string;
    browser: string;
    os: string;
    country: string;
    device: string;
  }) => {
    const { __type, eventName, urlPath: url, browser, os, country, device } = log;

    if (__type === TYPE_EVENT) {
      return (
        <FormattedMessage
          {...messages.eventLog}
          values={{
            event: <b>{eventName || formatMessage(labels.unknown)}</b>,
            url: (
              <a
                href={`//${website?.domain}${url}`}
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
          href={`//${website?.domain}${url}`}
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

    const { events, visitors } = data;

    let logs = [
      ...events.map(e => ({ __type: e.eventName ? TYPE_EVENT : TYPE_PAGEVIEW, ...e })),
      ...visitors.map(v => ({ __type: TYPE_SESSION, ...v })),
    ].sort(thenby.firstBy('timestamp', -1));

    if (search) {
      logs = logs.filter(({ eventName, urlPath, browser, os, country, device }) => {
        return [
          eventName,
          urlPath,
          os,
          formatValue(browser, 'browser'),
          formatValue(country, 'country'),
          formatValue(device, 'device'),
        ]
          .filter(n => n)
          .map(n => n.toLowerCase())
          .join('')
          .includes(search.toLowerCase());
      });
    }

    if (filter !== TYPE_ALL) {
      return logs.filter(({ __type }) => __type === filter);
    }

    return logs;
  }, [data, filter, formatValue, search]);

  return (
    <div className={styles.table}>
      <div className={styles.actions}>
        <SearchField className={styles.search} value={search} onSearch={setSearch} />
        <FilterButtons items={buttons} selectedKey={filter} onSelect={setFilter} />
      </div>
      <div className={styles.header}>{formatMessage(labels.activityLog)}</div>
      <div className={styles.body}>
        {logs?.length === 0 && <Empty />}
        {logs?.length > 0 && (
          <FixedSizeList width="100%" height={500} itemCount={logs.length} itemSize={50}>
            {Row}
          </FixedSizeList>
        )}
      </div>
    </div>
  );
}

export default RealtimeLog;
