import { DateDisplay } from '@/components/common/DateDisplay';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { formatNumber } from '@/lib/format';
import { Column, Grid, Heading, ListItem, Row, Select } from '@umami/react-zen';
import { useState } from 'react';

export function CompareTables({ websiteId }: { websiteId: string }) {
  const [data, setData] = useState([]);
  const { dateRange, dateCompare } = useDateRange();
  const { formatMessage, labels } = useMessages();
  const {
    router,
    updateParams,
    query: { view = 'path' },
  } = useNavigation();
  const { startDate, endDate } = dateCompare;

  const params = {
    startAt: startDate.getTime(),
    endAt: endDate.getTime(),
  };

  const renderPath = (view: string) => {
    return updateParams({ view });
  };

  const items = [
    {
      id: 'path',
      label: formatMessage(labels.path),
      path: renderPath('path'),
    },
    {
      id: 'channel',
      label: formatMessage(labels.channels),
      path: renderPath('channel'),
    },
    {
      id: 'referrer',
      label: formatMessage(labels.referrers),
      path: renderPath('referrer'),
    },
    {
      id: 'browser',
      label: formatMessage(labels.browsers),
      path: renderPath('browser'),
    },
    {
      id: 'os',
      label: formatMessage(labels.os),
      path: renderPath('os'),
    },
    {
      id: 'device',
      label: formatMessage(labels.devices),
      path: renderPath('device'),
    },
    {
      id: 'country',
      label: formatMessage(labels.countries),
      path: renderPath('country'),
    },
    {
      id: 'region',
      label: formatMessage(labels.regions),
      path: renderPath('region'),
    },
    {
      id: 'city',
      label: formatMessage(labels.cities),
      path: renderPath('city'),
    },
    {
      id: 'language',
      label: formatMessage(labels.languages),
      path: renderPath('language'),
    },
    {
      id: 'screen',
      label: formatMessage(labels.screens),
      path: renderPath('screen'),
    },
    {
      id: 'event',
      label: formatMessage(labels.events),
      path: renderPath('event'),
    },
    {
      id: 'hostname',
      label: formatMessage(labels.hostname),
      path: renderPath('hostname'),
    },
    {
      id: 'tag',
      label: formatMessage(labels.tags),
      path: renderPath('tag'),
    },
  ];

  const renderChange = ({ label, count }) => {
    const prev = data.find(d => d.x === label)?.y;
    const value = count - prev;
    const change = Math.abs(((count - prev) / prev) * 100);

    return (
      !isNaN(change) && (
        <Row alignItems="center" marginRight="3">
          <ChangeLabel value={value}>{formatNumber(change)}%</ChangeLabel>
        </Row>
      )
    );
  };

  const handleChange = (id: any) => {
    router.push(renderPath(id));
  };

  return (
    <>
      <Row width="300px">
        <Select
          items={items}
          label={formatMessage(labels.compare)}
          value={view}
          defaultValue={view}
          onChange={handleChange}
        >
          {items.map(({ id, label }) => (
            <ListItem key={id} id={id}>
              {label}
            </ListItem>
          ))}
        </Select>
      </Row>
      <Panel minHeight="300px">
        <Grid columns={{ xs: '1fr', lg: '1fr 1fr' }} gap="6" height="100%">
          <Column gap="6">
            <Row alignItems="center" justifyContent="space-between">
              <Heading size="2">{formatMessage(labels.previous)}</Heading>
              <DateDisplay startDate={startDate} endDate={endDate} />
            </Row>
            <MetricsTable
              websiteId={websiteId}
              type={view}
              limit={20}
              showMore={false}
              params={params}
              onDataLoad={setData}
            />
          </Column>
          <Column border="left" paddingLeft="6" gap="6">
            <Row alignItems="center" justifyContent="space-between">
              <Heading size="2"> {formatMessage(labels.current)}</Heading>
              <DateDisplay startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </Row>
            <MetricsTable
              websiteId={websiteId}
              type={view}
              limit={20}
              showMore={false}
              renderChange={renderChange}
            />
          </Column>
        </Grid>
      </Panel>
    </>
  );
}
