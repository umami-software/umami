'use client';
import {
  Button,
  Column,
  Icon,
  Row,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
} from '@umami/react-zen';
import { X } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useMobile, useWebsiteSessionQuery } from '@/components/hooks';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionInfo } from './SessionInfo';
import { SessionReplaysDataTable } from './SessionReplaysDataTable';
import { SessionStats } from './SessionStats';

export function SessionProfile({
  websiteId,
  sessionId,
  showReplays = true,
  onClose,
}: {
  websiteId: string;
  sessionId: string;
  showReplays?: boolean;
  onClose?: () => void;
}) {
  const { data, isLoading, error } = useWebsiteSessionQuery(websiteId, sessionId);
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {data && (
        <Column gap>
          {onClose && (
            <Row justifyContent="flex-end">
              <Button onPress={onClose} variant="quiet">
                <Icon>
                  <X />
                </Icon>
              </Button>
            </Row>
          )}
          <Column gap="6">
            <Row
              justifyContent="center"
              alignItems="center"
              gap="6"
              style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
            >
              <Avatar seed={data?.id} size={isMobile ? 80 : 128} />
              <Column width={isMobile ? '100%' : '360px'} minWidth="0" maxWidth="360px">
                <TextField label="ID" value={data?.id} allowCopy />
              </Column>
            </Row>
            <SessionStats data={data} />
            <SessionInfo data={data} />

            <Tabs>
              <TabList>
                <Tab id="activity">{t(labels.activity)}</Tab>
                <Tab id="properties">{t(labels.properties)}</Tab>
                {showReplays && <Tab id="replays">{t(labels.replays)}</Tab>}
              </TabList>
              <TabPanel id="activity">
                <SessionActivity
                  websiteId={websiteId}
                  sessionId={sessionId}
                  startDate={data?.firstAt}
                  endDate={data?.lastAt}
                  distinctId={data?.distinctId}
                />
              </TabPanel>
              <TabPanel id="properties">
                <SessionData sessionId={sessionId} websiteId={websiteId} />
              </TabPanel>
              {showReplays && (
                <TabPanel id="replays">
                  <SessionReplaysDataTable websiteId={websiteId} sessionId={sessionId} />
                </TabPanel>
              )}
            </Tabs>
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}
