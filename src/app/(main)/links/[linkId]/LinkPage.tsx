'use client';
import { PageBody } from '@/components/common/PageBody';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { Grid, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { ChannelsTable } from '@/components/metrics/ChannelsTable';
import { RegionsTable } from '@/components/metrics/RegionsTable';
import { CitiesTable } from '@/components/metrics/CitiesTable';
import { SessionsWeekly } from '@/app/(main)/websites/[websiteId]/sessions/SessionsWeekly';
import { useMessages } from '@/components/hooks';

export function LinkPage({ linkId }: { linkId: string }) {
  const { formatMessage, labels } = useMessages();
  const tableProps = { websiteId: linkId, limit: 10, allowDownload: false };
  const rowProps = { minHeight: 570 };

  return (
    <LinkProvider linkId={linkId}>
      <PageBody gap>
        <LinkHeader />
        <LinkControls linkId={linkId} />
        <LinkMetricsBar linkId={linkId} showChange={true} />
        <Panel>
          <WebsiteChart websiteId={linkId} />
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
              <WorldMap websiteId={linkId} />
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
              <SessionsWeekly websiteId={linkId} />
            </Panel>
          </GridRow>
        </Grid>
      </PageBody>
    </LinkProvider>
  );
}
