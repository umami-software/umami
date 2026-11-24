'use client';
import {
  Button,
  Column,
  Icon,
  Row,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
} from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useConfig,
  useMessages,
  useMobile,
  useNavigation,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { X } from '@/components/icons';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionDeleteButton } from './SessionDeleteButton';
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
  const config = useConfig();
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const showDeleteButton = Boolean(
    !isSharePage && config?.sessionDeletionEnabled && data?.canDelete,
  );

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {data && (
        <Column gap width="100%" minWidth="0" position="relative">
          {onClose && (
            // Overlaid in the corner so the actions don't push the profile down.
            <Row
              justifyContent="flex-end"
              gap="1"
              style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
            >
              {showDeleteButton && (
                <SessionDeleteButton websiteId={websiteId} sessionId={sessionId} onSave={onClose} />
              )}
              <Button onClick={onClose} variant="ghost">
                <Icon>
                  <X />
                </Icon>
              </Button>
            </Row>
          )}
          <Column gap="6" width="100%" minWidth="0">
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
              <TabsList>
                <TabsTrigger value="activity">{t(labels.activity)}</TabsTrigger>
                <TabsTrigger value="properties">{t(labels.properties)}</TabsTrigger>
                {showReplays && <TabsTrigger value="replays">{t(labels.replays)}</TabsTrigger>}
              </TabsList>
              <TabsContent value="activity">
                <SessionActivity
                  websiteId={websiteId}
                  sessionId={sessionId}
                  startDate={data?.firstAt}
                  endDate={data?.lastAt}
                  distinctId={data?.distinctId}
                />
              </TabsContent>
              <TabsContent value="properties">
                <SessionData sessionId={sessionId} websiteId={websiteId} />
              </TabsContent>
              {showReplays && (
                <TabsContent
                  value="replays"
                  style={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}
                >
                  <SessionReplaysDataTable websiteId={websiteId} sessionId={sessionId} />
                </TabsContent>
              )}
            </Tabs>
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}
