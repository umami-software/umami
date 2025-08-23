import { Grid, Heading, Column, Row, NavMenu, NavMenuItem, Text } from '@umami/react-zen';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { getCompareDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { useState } from 'react';
import { Panel } from '@/components/common/Panel';
import { DateDisplay } from '@/components/common/DateDisplay';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';

export function WebsiteCompareTables({ websiteId }: { websiteId: string }) {
  const [data] = useState([]);
  const { dateRange, dateCompare } = useDateRange(websiteId);
  const { formatMessage, labels } = useMessages();
  const {
    updateParams,
    query: { view },
  } = useNavigation();

  const items = [
    {
      id: 'path',
      label: formatMessage(labels.pages),
      path: updateParams({ view: 'path' }),
    },
    {
      id: 'referrer',
      label: formatMessage(labels.referrers),
      path: updateParams({ view: 'referrer' }),
    },
    {
      id: 'browser',
      label: formatMessage(labels.browsers),
      path: updateParams({ view: 'browser' }),
    },
    {
      id: 'os',
      label: formatMessage(labels.os),
      path: updateParams({ view: 'os' }),
    },
    {
      id: 'device',
      label: formatMessage(labels.devices),
      path: updateParams({ view: 'device' }),
    },
    {
      id: 'country',
      label: formatMessage(labels.countries),
      path: updateParams({ view: 'country' }),
    },
    {
      id: 'region',
      label: formatMessage(labels.regions),
      path: updateParams({ view: 'region' }),
    },
    {
      id: 'city',
      label: formatMessage(labels.cities),
      path: updateParams({ view: 'city' }),
    },
    {
      id: 'language',
      label: formatMessage(labels.languages),
      path: updateParams({ view: 'language' }),
    },
    {
      id: 'screen',
      label: formatMessage(labels.screens),
      path: updateParams({ view: 'screen' }),
    },
    {
      id: 'event',
      label: formatMessage(labels.events),
      path: updateParams({ view: 'event' }),
    },
    {
      id: 'query',
      label: formatMessage(labels.queryParameters),
      path: updateParams({ view: 'query' }),
    },
    {
      id: 'hostname',
      label: formatMessage(labels.hostname),
      path: updateParams({ view: 'hostname' }),
    },
    {
      id: 'tag',
      label: formatMessage(labels.tags),
      path: updateParams({ view: 'tag' }),
    },
  ];

  const renderChange = ({ label: x, count: y }) => {
    const prev = data.find(d => d.x === x)?.y;
    const value = y - prev;
    const change = Math.abs(((y - prev) / prev) * 100);

    return (
      !isNaN(change) && (
        <Row alignItems="center" marginRight="3">
          <ChangeLabel value={value}>{formatNumber(change)}%</ChangeLabel>
        </Row>
      )
    );
  };

  const { startDate, endDate } = getCompareDate(
    dateCompare,
    dateRange.startDate,
    dateRange.endDate,
  );

  const params = {
    startAt: startDate.getTime(),
    endAt: endDate.getTime(),
  };

  return (
    <Panel>
      <Grid columns={{ xs: '1fr', lg: '200px 1fr 1fr' }} gap="6">
        <NavMenu>
          {items.map(({ id, label }) => {
            return (
              <NavMenuItem key={id}>
                <Text>{label}</Text>
              </NavMenuItem>
            );
          })}
        </NavMenu>
        <Column border="left" paddingLeft="6" gap="6">
          <Row alignItems="center" justifyContent="space-between">
            <Heading size="1">{formatMessage(labels.previous)}</Heading>
            <DateDisplay startDate={startDate} endDate={endDate} />
          </Row>
          <MetricsTable
            websiteId={websiteId}
            type={view}
            limit={20}
            showMore={false}
            params={params}
          />
        </Column>
        <Column border="left" paddingLeft="6" gap="6">
          <Row alignItems="center" justifyContent="space-between">
            <Heading size="1"> {formatMessage(labels.current)}</Heading>
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
  );
}
