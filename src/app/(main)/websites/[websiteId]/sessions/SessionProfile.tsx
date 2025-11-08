import {
  TextField,
  Row,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  Icon,
} from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteSessionQuery } from '@/components/hooks';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionInfo } from './SessionInfo';
import { SessionStats } from './SessionStats';
import { X } from 'lucide-react';

export function SessionProfile({
  websiteId,
  sessionId,
  onClose,
}: {
  websiteId: string;
  sessionId: string;
  onClose?: () => void;
}) {
  const { data, isLoading, error } = useWebsiteSessionQuery(websiteId, sessionId);
  const { formatMessage, labels } = useMessages();

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
            <Row justifyContent="center" alignItems="center" gap="6">
              <Avatar seed={data?.id} size={128} />
              <Column width="360px">
                <TextField label="ID" value={data?.id} allowCopy />
              </Column>
            </Row>
            <SessionStats data={data} />
            <SessionInfo data={data} />

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
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}
