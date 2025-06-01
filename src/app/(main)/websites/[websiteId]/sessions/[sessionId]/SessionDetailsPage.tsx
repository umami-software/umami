'use client';
import { Grid, Row, Column, Tabs, TabList, Tab, TabPanel } from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteSessionQuery } from '@/components/hooks';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionInfo } from './SessionInfo';
import { SessionStats } from './SessionStats';
import { Panel } from '@/components/common/Panel';

export function SessionDetailsPage({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data, isLoading, error } = useWebsiteSessionQuery(websiteId, sessionId);
  const { formatMessage, labels } = useMessages();

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Grid columns="260px 1fr" gap>
          <Column gap="6">
            <Row justifyContent="center">
              <Avatar seed={data?.id} size={128} />
            </Row>
            <SessionInfo data={data} />
          </Column>
          <Column gap>
            <SessionStats data={data} />
            <Panel>
              <Tabs>
                <TabList>
                  <Tab id="activity">{formatMessage(labels.activity)}</Tab>
                  <Tab id="properties">{formatMessage(labels.properties)}</Tab>
                </TabList>
                <TabPanel id="activity">
                  <SessionActivity
                    websiteId={websiteId}
                    sessionId={sessionId}
                    startDate={data?.firstAt}
                    endDate={data?.lastAt}
                  />
                </TabPanel>
                <TabPanel id="properties">
                  <SessionData sessionId={sessionId} websiteId={websiteId} />
                </TabPanel>
              </Tabs>
            </Panel>
          </Column>
        </Grid>
      )}
    </LoadingPanel>
  );
}
