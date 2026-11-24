import { Grid, Heading, Row, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
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
            <TabsList>
              <TabsTrigger value="path">{t(labels.path)}</TabsTrigger>
              <TabsTrigger value="fullPath">{t(labels.url)}</TabsTrigger>
              <TabsTrigger value="entry">{t(labels.entry)}</TabsTrigger>
              <TabsTrigger value="exit">{t(labels.exit)}</TabsTrigger>
            </TabsList>
            <TabsContent value="path">
              <MetricsTable type="path" title={t(labels.path)} {...tableProps} />
            </TabsContent>
            <TabsContent value="fullPath">
              <MetricsTable type="fullPath" title={t(labels.url)} {...tableProps} />
            </TabsContent>
            <TabsContent value="entry">
              <MetricsTable type="entry" title={t(labels.path)} {...tableProps} />
            </TabsContent>
            <TabsContent value="exit">
              <MetricsTable type="exit" title={t(labels.path)} {...tableProps} />
            </TabsContent>
          </Tabs>
        </Panel>
        <Panel>
          <Heading size="2xl">{t(labels.sources)}</Heading>
          <Tabs>
            <TabsList>
              <TabsTrigger value="referrer">{t(labels.referrers)}</TabsTrigger>
              <TabsTrigger value="channel">{t(labels.channels)}</TabsTrigger>
            </TabsList>
            <TabsContent value="referrer">
              <MetricsTable type="referrer" title={t(labels.referrer)} {...tableProps} />
            </TabsContent>
            <TabsContent value="channel">
              <MetricsTable type="channel" title={t(labels.channel)} {...tableProps} />
            </TabsContent>
          </Tabs>
        </Panel>
      </GridRow>

      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Heading size="2xl">{t(labels.environment)}</Heading>
          <Tabs>
            <TabsList>
              <TabsTrigger value="browser">{t(labels.browsers)}</TabsTrigger>
              <TabsTrigger value="os">{t(labels.os)}</TabsTrigger>
              <TabsTrigger value="device">{t(labels.devices)}</TabsTrigger>
            </TabsList>
            <TabsContent value="browser">
              <MetricsTable type="browser" title={t(labels.browser)} {...tableProps} />
            </TabsContent>
            <TabsContent value="os">
              <MetricsTable type="os" title={t(labels.os)} {...tableProps} />
            </TabsContent>
            <TabsContent value="device">
              <MetricsTable type="device" title={t(labels.device)} {...tableProps} />
            </TabsContent>
          </Tabs>
        </Panel>

        <Panel>
          <Heading size="2xl">{t(labels.location)}</Heading>
          <Tabs>
            <TabsList>
              <TabsTrigger value="country">{t(labels.countries)}</TabsTrigger>
              <TabsTrigger value="region">{t(labels.regions)}</TabsTrigger>
              <TabsTrigger value="city">{t(labels.cities)}</TabsTrigger>
            </TabsList>
            <TabsContent value="country">
              <MetricsTable type="country" title={t(labels.country)} {...tableProps} />
            </TabsContent>
            <TabsContent value="region">
              <MetricsTable type="region" title={t(labels.region)} {...tableProps} />
            </TabsContent>
            <TabsContent value="city">
              <MetricsTable type="city" title={t(labels.city)} {...tableProps} />
            </TabsContent>
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
