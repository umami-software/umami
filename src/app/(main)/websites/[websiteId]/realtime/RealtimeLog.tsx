import { useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { SearchField, Text, Column, Row, IconLabel, Heading } from '@umami/react-zen';
import Link from 'next/link';
import { useFormat } from '@/components//hooks/useFormat';
import { Empty } from '@/components/common/Empty';
import { FilterButtons } from '@/components/input/FilterButtons';
import {
  useCountryNames,
  useLocale,
  useMessages,
  useMobile,
  useNavigation,
  useTimezone,
  useWebsite,
} from '@/components/hooks';
import { Eye, User } from '@/components/icons';
import { Lightning } from '@/components/svg';
import { BROWSERS, OS_NAMES } from '@/lib/constants';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { Avatar } from '@/components/common/Avatar';

const TYPE_ALL = 'all';
const TYPE_PAGEVIEW = 'pageview';
const TYPE_SESSION = 'session';
const TYPE_EVENT = 'event';

const icons = {
  [TYPE_PAGEVIEW]: <Eye />,
  [TYPE_SESSION]: <User />,
  [TYPE_EVENT]: <Lightning />,
};

export function RealtimeLog({ data }: { data: any }) {
  const website = useWebsite();
  const [search, setSearch] = useState('');
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const { formatTimezoneDate } = useTimezone();
  const { countryNames } = useCountryNames(locale);
  const [filter, setFilter] = useState(TYPE_ALL);
  const { updateParams } = useNavigation();
  const { isPhone } = useMobile();

  const buttons = [
    {
      label: formatMessage(labels.all),
      id: TYPE_ALL,
    },
    {
      label: formatMessage(labels.views),
      id: TYPE_PAGEVIEW,
    },
    {
      label: formatMessage(labels.visitors),
      id: TYPE_SESSION,
    },
    {
      label: formatMessage(labels.events),
      id: TYPE_EVENT,
    },
  ];

  const getTime = ({ createdAt, firstAt }) => formatTimezoneDate(firstAt || createdAt, 'pp');

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
    const { __type, eventName, urlPath, browser, os, country, device } = log;

    if (__type === TYPE_EVENT) {
      return (
        <FormattedMessage
          {...messages.eventLog}
          values={{
            event: <b key="b">{eventName || formatMessage(labels.unknown)}</b>,
            url: (
              <a
                key="a"
                href={`//${website?.domain}${urlPath}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {urlPath}
              </a>
            ),
          }}
        />
      );
    }

    if (__type === TYPE_PAGEVIEW) {
      return (
        <a href={`//${website?.domain}${urlPath}`} target="_blank" rel="noreferrer noopener">
          {urlPath}
        </a>
      );
    }

    if (__type === TYPE_SESSION) {
      return (
        <FormattedMessage
          {...messages.visitorLog}
          values={{
            country: <b key="country">{countryNames[country] || formatMessage(labels.unknown)}</b>,
            browser: <b key="browser">{BROWSERS[browser]}</b>,
            os: <b key="os">{OS_NAMES[os] || os}</b>,
            device: <b key="device">{formatMessage(labels[device] || labels.unknown)}</b>,
          }}
        />
      );
    }
  };

  const TableRow = ({ index, style }) => {
    const row = logs[index];
    return (
      <Row alignItems="center" style={style} gap>
        <Row minWidth="30px">
          <Link href={updateParams({ session: row.sessionId })}>
            <Avatar seed={row.sessionId} size={32} />
          </Link>
        </Row>
        <Row minWidth="100px">
          <Text wrap="nowrap">{getTime(row)}</Text>
        </Row>
        <IconLabel icon={getIcon(row)}>
          <Text style={{ maxWidth: isPhone ? '400px' : null }} truncate>
            {getDetail(row)}
          </Text>
        </IconLabel>
      </Row>
    );
  };

  const logs = useMemo(() => {
    if (!data) {
      return [];
    }

    let logs = data.events;

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
    <Column gap>
      <Heading size="2">{formatMessage(labels.activity)}</Heading>
      {isPhone ? (
        <>
          <Row>
            <SearchField value={search} onSearch={setSearch} />
          </Row>
          <Row>
            <FilterButtons items={buttons} value={filter} onChange={setFilter} />
          </Row>
        </>
      ) : (
        <Row alignItems="center" justifyContent="space-between">
          <SearchField value={search} onSearch={setSearch} />
          <FilterButtons items={buttons} value={filter} onChange={setFilter} />
        </Row>
      )}

      <Column>
        {logs?.length === 0 && <Empty />}
        {logs?.length > 0 && (
          <FixedSizeList width="100%" height={500} itemCount={logs.length} itemSize={50}>
            {TableRow}
          </FixedSizeList>
        )}
      </Column>
      <SessionModal websiteId={website.id} />
    </Column>
  );
}
