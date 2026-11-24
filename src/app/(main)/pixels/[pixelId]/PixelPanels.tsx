import { Grid, Heading, Row, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
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
          <Tabs>
            <Row alignItems="center" justifyContent="space-between" gap="3" wrap="wrap">
              <Heading size="2xl">{t(labels.sources)}</Heading>
              <TabsList>
                <TabsTrigger className="text-xs" value="referrer">
                  {t(labels.referrers)}
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="channel">
                  {t(labels.channels)}
                </TabsTrigger>
              </TabsList>
            </Row>
            <TabsContent value="referrer">
              <MetricsTable type="referrer" title={t(labels.domain)} {...tableProps} />
            </TabsContent>
            <TabsContent value="channel">
              <MetricsTable type="channel" title={t(labels.type)} {...tableProps} />
            </TabsContent>
          </Tabs>
        </Panel>
        <Panel>
          <Tabs>
            <Row alignItems="center" justifyContent="space-between" gap="3" wrap="wrap">
              <Heading size="2xl">{t(labels.environment)}</Heading>
              <TabsList>
                <TabsTrigger className="text-xs" value="browser">
                  {t(labels.browsers)}
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="os">
                  {t(labels.os)}
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="device">
                  {t(labels.devices)}
                </TabsTrigger>
              </TabsList>
            </Row>
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
          <Tabs>
            <Row alignItems="center" justifyContent="space-between" gap="3" wrap="wrap">
              <Heading size="2xl">{t(labels.location)}</Heading>
              <TabsList>
                <TabsTrigger className="text-xs" value="country">
                  {t(labels.countries)}
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="region">
                  {t(labels.regions)}
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="city">
                  {t(labels.cities)}
                </TabsTrigger>
              </TabsList>
            </Row>
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
