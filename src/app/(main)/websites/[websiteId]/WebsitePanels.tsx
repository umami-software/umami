import { Grid, Heading, Row, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { useMessages, useMobile } from '@/components/hooks';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';

export function WebsitePanels({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const tableProps = {
    websiteId,
    limit: 10,
    allowDownload: false,
    showMore: true,
    metric: t(labels.visitors),
  };
  const rowProps = { minHeight: '570px' };
  const { isMobile } = useMobile();

  return (
    <Grid gap="3">
      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2xl">{t(labels.pages)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="path">{t(labels.path)}</Tab>
              <Tab id="entry">{t(labels.entry)}</Tab>
              <Tab id="exit">{t(labels.exit)}</Tab>
            </TabList>
            <TabPanel id="path">
              <MetricsTable type="path" title={t(labels.path)} {...tableProps} />
            </TabPanel>
            <TabPanel id="entry">
              <MetricsTable type="entry" title={t(labels.path)} {...tableProps} />
            </TabPanel>
            <TabPanel id="exit">
              <MetricsTable type="exit" title={t(labels.path)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
        <Panel>
          <Heading size="2xl">{t(labels.sources)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="referrer">{t(labels.referrers)}</Tab>
              <Tab id="channel">{t(labels.channels)}</Tab>
            </TabList>
            <TabPanel id="referrer">
              <MetricsTable type="referrer" title={t(labels.referrer)} {...tableProps} />
            </TabPanel>
            <TabPanel id="channel">
              <MetricsTable type="channel" title={t(labels.channel)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
      </GridRow>

      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2xl">{t(labels.environment)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="browser">{t(labels.browsers)}</Tab>
              <Tab id="os">{t(labels.os)}</Tab>
              <Tab id="device">{t(labels.devices)}</Tab>
            </TabList>
            <TabPanel id="browser">
              <MetricsTable type="browser" title={t(labels.browser)} {...tableProps} />
            </TabPanel>
            <TabPanel id="os">
              <MetricsTable type="os" title={t(labels.os)} {...tableProps} />
            </TabPanel>
            <TabPanel id="device">
              <MetricsTable type="device" title={t(labels.device)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>

        <Panel>
          <Heading size="2xl">{t(labels.location)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="country">{t(labels.countries)}</Tab>
              <Tab id="region">{t(labels.regions)}</Tab>
              <Tab id="city">{t(labels.cities)}</Tab>
            </TabList>
            <TabPanel id="country">
              <MetricsTable type="country" title={t(labels.country)} {...tableProps} />
            </TabPanel>
            <TabPanel id="region">
              <MetricsTable type="region" title={t(labels.region)} {...tableProps} />
            </TabPanel>
            <TabPanel id="city">
              <MetricsTable type="city" title={t(labels.city)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
      </GridRow>

      <GridRow layout="two-one" {...rowProps}>
        <Panel paddingX="0" paddingY="0" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <WorldMap websiteId={websiteId} />
        </Panel>

        <Panel>
          <Heading size="2xl">{t(labels.traffic)}</Heading>
          <Row border="bottom" marginBottom="4" />
          <WeeklyTraffic websiteId={websiteId} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
