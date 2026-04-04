import { Column, Grid, Heading, ListItem, Row, Select } from '@umami/react-zen';
import { useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { formatNumber } from '@/lib/format';

export function CompareTables({ websiteId }: { websiteId: string }) {
  const [data, setData] = useState([]);
  const { dateRange, dateCompare } = useDateRange();
  const { t, labels } = useMessages();
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
      label: t(labels.path),
      path: renderPath('path'),
    },
    {
      id: 'channel',
      label: t(labels.channels),
      path: renderPath('channel'),
    },
    {
      id: 'referrer',
      label: t(labels.referrers),
      path: renderPath('referrer'),
    },
    {
      id: 'browser',
      label: t(labels.browsers),
      path: renderPath('browser'),
    },
    {
      id: 'os',
      label: t(labels.os),
      path: renderPath('os'),
    },
    {
      id: 'device',
      label: t(labels.devices),
      path: renderPath('device'),
    },
    {
      id: 'country',
      label: t(labels.countries),
      path: renderPath('country'),
    },
    {
      id: 'region',
      label: t(labels.regions),
      path: renderPath('region'),
    },
    {
      id: 'city',
      label: t(labels.cities),
      path: renderPath('city'),
    },
    {
      id: 'language',
      label: t(labels.languages),
      path: renderPath('language'),
    },
    {
      id: 'screen',
      label: t(labels.screens),
      path: renderPath('screen'),
    },
    {
      id: 'event',
      label: t(labels.events),
      path: renderPath('event'),
    },
    {
      id: 'utmSource',
      label: t(labels.utmSource),
      path: renderPath('utmSource'),
    },
    {
      id: 'utmMedium',
      label: t(labels.utmMedium),
      path: renderPath('utmMedium'),
    },
    {
      id: 'utmCampaign',
      label: t(labels.utmCampaign),
      path: renderPath('utmCampaign'),
    },
    {
      id: 'utmContent',
      label: t(labels.utmContent),
      path: renderPath('utmContent'),
    },
    {
      id: 'utmTerm',
      label: t(labels.utmTerm),
      path: renderPath('utmTerm'),
    },
    {
      id: 'hostname',
      label: t(labels.hostname),
      path: renderPath('hostname'),
    },
    {
      id: 'distinctId',
      label: t(labels.distinctId),
      path: renderPath('distinctId'),
    },
    {
      id: 'tag',
      label: t(labels.tags),
      path: renderPath('tag'),
    },
  ];

  const renderChange = ({ label, count }) => {
    const prev = data.find(d => d.x === label)?.y;
    const value = count - prev;
    const change = Math.abs(((count - prev) / prev) * 100);

    return (
      !Number.isNaN(change) && (
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
          label={t(labels.compare)}
          value={view}
          defaultValue={view}
          onChange={handleChange}
          style={{ width: 200 }}
          popoverProps={{ style: { width: 200 } }}
        >
          {items.map(({ id, label }) => (
            <ListItem key={id} id={id}>
              {label}
            </ListItem>
          ))}
        </Select>
      </Row>
      <Panel minHeight="300px">
        <Grid columns={{ base: '1fr', lg: '1fr 1fr' }} gap="6" height="100%">
          <Column gap="6">
            <Row alignItems="center" justifyContent="space-between">
              <Heading size="base">{t(labels.previous)}</Heading>
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
              <Heading size="base"> {t(labels.current)}</Heading>
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
