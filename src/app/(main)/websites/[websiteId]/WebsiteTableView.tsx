import { Grid, Tabs, Tab, TabList, TabPanel } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { PagesTable } from '@/components/metrics/PagesTable';
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

export function WebsiteTableView({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const tableProps = { websiteId, limit: 10, allowDownload: false };
  const rowProps = { minHeight: 570 };

  return (
    <Grid gap="3">
      <GridRow layout="two" {...rowProps}>
        <Panel>
          <Tabs>
            <TabList>
              <Tab id="page">{formatMessage(labels.pages)}</Tab>
              <Tab id="entry">{formatMessage(labels.entry)}</Tab>
              <Tab id="exit">{formatMessage(labels.exit)}</Tab>
            </TabList>
            <TabPanel id="page">
              <PagesTable type="path" {...tableProps} />
            </TabPanel>
            <TabPanel id="entry">
              <PagesTable type="entry" {...tableProps} />
            </TabPanel>
            <TabPanel id="exit">
              <PagesTable type="exit" {...tableProps} />
            </TabPanel>
          </Tabs>
        </Panel>
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
          <WorldMap websiteId={websiteId} />
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
          <SessionsWeekly websiteId={websiteId} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
