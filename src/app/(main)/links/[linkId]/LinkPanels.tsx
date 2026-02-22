import { Grid, Heading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WorldMap } from '@/components/metrics/WorldMap';

export function LinkPanels({ linkId }: { linkId: string }) {
  const { t, labels } = useMessages();
  const tableProps = {
    websiteId: linkId,
    limit: 10,
    allowDownload: false,
    showMore: true,
    metric: t(labels.visitors),
  };
  const rowProps = { minHeight: 570 };

  return (
    <Grid gap="3">
      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2xl">{t(labels.sources)}</Heading>
          <Tabs>
            <TabList>
              <Tab id="referrer">{t(labels.referrers)}</Tab>
              <Tab id="channel">{t(labels.channels)}</Tab>
            </TabList>
            <TabPanel id="referrer">
              <MetricsTable type="referrer" title={t(labels.domain)} {...tableProps} />
            </TabPanel>
            <TabPanel id="channel">
              <MetricsTable type="channel" title={t(labels.type)} {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
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
      </GridRow>
      <GridRow layout="two" {...rowProps}>
        <Panel padding="0">
          <WorldMap websiteId={linkId} />
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
    </Grid>
  );
}
