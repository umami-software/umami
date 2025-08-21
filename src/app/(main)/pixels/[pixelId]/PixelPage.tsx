'use client';
import { PageBody } from '@/components/common/PageBody';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { Grid, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { useMessages } from '@/components/hooks';
import { ChannelsTable } from '@/components/metrics/ChannelsTable';
import { RegionsTable } from '@/components/metrics/RegionsTable';
import { CitiesTable } from '@/components/metrics/CitiesTable';
import { SessionsWeekly } from '@/app/(main)/websites/[websiteId]/sessions/SessionsWeekly';

export function PixelPage({ pixelId }: { pixelId: string }) {
  const { formatMessage, labels } = useMessages();
  const tableProps = { websiteId: pixelId, limit: 10, allowDownload: false };
  const rowProps = { minHeight: 570 };

  return (
    <PixelProvider pixelId={pixelId}>
      <PageBody gap>
        <PixelHeader />
        <PixelControls pixelId={pixelId} />
        <PixelMetricsBar pixelId={pixelId} showChange={true} />
        <Panel>
          <WebsiteChart websiteId={pixelId} />
        </Panel>
        <Grid gap>
          <GridRow layout="one" {...rowProps}>
            <Panel>
              <Tabs>
                <TabList>
                  <Tab id="referrer">{formatMessage(labels.referrers)}</Tab>
                  <Tab id="channel">{formatMessage(labels.channels)}</Tab>
                </TabList>
                <TabPanel id="referrer">
                  <ReferrersTable {...tableProps} />
                </TabPanel>
                <TabPanel id="channel">
                  <ChannelsTable {...tableProps} />
                </TabPanel>
              </Tabs>
            </Panel>
          </GridRow>
          <GridRow layout="two-one" {...rowProps}>
            <Panel gridColumn="span 2" noPadding>
              <WorldMap websiteId={pixelId} />
            </Panel>
            <Panel>
              <Tabs>
                <TabList>
                  <Tab id="country">{formatMessage(labels.countries)}</Tab>
                  <Tab id="region">{formatMessage(labels.regions)}</Tab>
                  <Tab id="city">{formatMessage(labels.cities)}</Tab>
                </TabList>
                <TabPanel id="country">
                  <CountriesTable {...tableProps} />
                </TabPanel>
                <TabPanel id="region">
                  <RegionsTable {...tableProps} />
                </TabPanel>
                <TabPanel id="city">
                  <CitiesTable {...tableProps} />
                </TabPanel>
              </Tabs>
            </Panel>
          </GridRow>
          <GridRow layout="two" {...rowProps}>
            <Panel>
              <Tabs>
                <TabList>
                  <Tab id="browser">{formatMessage(labels.browsers)}</Tab>
                  <Tab id="os">{formatMessage(labels.os)}</Tab>
                  <Tab id="device">{formatMessage(labels.devices)}</Tab>
                </TabList>
                <TabPanel id="browser">
                  <BrowsersTable {...tableProps} />
                </TabPanel>
                <TabPanel id="os">
                  <OSTable {...tableProps} />
                </TabPanel>
                <TabPanel id="device">
                  <DevicesTable {...tableProps} />
                </TabPanel>
              </Tabs>
            </Panel>
            <Panel>
              <SessionsWeekly websiteId={pixelId} />
            </Panel>
          </GridRow>
        </Grid>
      </PageBody>
    </PixelProvider>
  );
}
