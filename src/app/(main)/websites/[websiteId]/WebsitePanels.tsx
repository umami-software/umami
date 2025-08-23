import { Grid, Tabs, Tab, TabList, TabPanel, Heading, Row } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { WorldMap } from '@/components/metrics/WorldMap';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { useMessages } from '@/components/hooks';

export function WebsitePanels({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const tableProps = {
    websiteId,
    limit: 10,
    allowDownload: false,
    showMore: true,
    metric: formatMessage(labels.visitors),
  };
  const rowProps = { minHeight: 570 };

  return (
    <Grid gap="3">
      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2">{formatMessage(labels.pages)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="page">{formatMessage(labels.pages)}</Tab>
              <Tab id="entry">{formatMessage(labels.entry)}</Tab>
              <Tab id="exit">{formatMessage(labels.exit)}</Tab>
            </TabList>
            <TabPanel id="page">
              <MetricsTable type="path" title={formatMessage(labels.path)} {...tableProps} />
            </TabPanel>
            <TabPanel id="entry">
              <MetricsTable type="entry" title={formatMessage(labels.path)} {...tableProps} />
            </TabPanel>
            <TabPanel id="exit">
              <MetricsTable type="exit" title={formatMessage(labels.path)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
        <Panel>
          <Heading size="2">{formatMessage(labels.sources)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="referrer">{formatMessage(labels.referrers)}</Tab>
              <Tab id="channel">{formatMessage(labels.channels)}</Tab>
            </TabList>
            <TabPanel id="referrer">
              <MetricsTable type="referrer" title={formatMessage(labels.domain)} {...tableProps} />
            </TabPanel>
            <TabPanel id="channel">
              <MetricsTable type="channel" title={formatMessage(labels.type)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
      </GridRow>
      <GridRow layout="two-one" {...rowProps}>
        <Panel gridColumn="span 2" noPadding>
          <WorldMap websiteId={websiteId} />
        </Panel>
        <Panel>
          <Heading size="2">{formatMessage(labels.location)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="country">{formatMessage(labels.countries)}</Tab>
              <Tab id="region">{formatMessage(labels.regions)}</Tab>
              <Tab id="city">{formatMessage(labels.cities)}</Tab>
            </TabList>
            <TabPanel id="country">
              <MetricsTable type="country" title={formatMessage(labels.country)} {...tableProps} />
            </TabPanel>
            <TabPanel id="region">
              <MetricsTable type="region" title={formatMessage(labels.region)} {...tableProps} />
            </TabPanel>
            <TabPanel id="city">
              <MetricsTable type="city" title={formatMessage(labels.city)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
      </GridRow>
      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2">{formatMessage(labels.environment)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="browser">{formatMessage(labels.browsers)}</Tab>
              <Tab id="os">{formatMessage(labels.os)}</Tab>
              <Tab id="device">{formatMessage(labels.devices)}</Tab>
            </TabList>
            <TabPanel id="browser">
              <MetricsTable type="browser" title={formatMessage(labels.browser)} {...tableProps} />
            </TabPanel>
            <TabPanel id="os">
              <MetricsTable type="os" title={formatMessage(labels.os)} {...tableProps} />
            </TabPanel>
            <TabPanel id="device">
              <MetricsTable type="device" title={formatMessage(labels.device)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
        <Panel>
          <Heading size="2">{formatMessage(labels.traffic)}</Heading>
          <Row border="bottom" marginBottom="4" />
          <WeeklyTraffic websiteId={websiteId} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
