import { Grid, Heading, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WorldMap } from '@/components/metrics/WorldMap';

export function PixelPanels({ pixelId }: { pixelId: string }) {
  const { t, labels } = useMessages();
  const tableProps = {
    websiteId: pixelId,
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
            <TabsList>
              <TabsTrigger value="referrer">{t(labels.referrers)}</TabsTrigger>
              <TabsTrigger value="channel">{t(labels.channels)}</TabsTrigger>
            </TabsList>
            <TabsContent value="referrer">
              <MetricsTable type="referrer" title={t(labels.domain)} {...tableProps} />
            </TabsContent>
            <TabsContent value="channel">
              <MetricsTable type="channel" title={t(labels.type)} {...tableProps} />
            </TabsContent>
          </Tabs>
        </Panel>
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
      </GridRow>
      <GridRow layout="two" {...rowProps}>
        <Panel padding="0">
          <WorldMap websiteId={pixelId} />
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
    </Grid>
  );
}
