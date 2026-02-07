'use client';
import { Column, Row, Text } from '@umami/react-zen';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useReplayQuery, useWebsiteSessionQuery } from '@/components/hooks';
import { ReplayPlayer } from './ReplayPlayer';

export function ReplayPlayback({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, sessionId);
  const { data: session } = useWebsiteSessionQuery(websiteId, sessionId);
  const { formatMessage, labels } = useMessages();

  return (
    <LoadingPanel
      data={replay}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {replay && (
        <Column gap="6">
          {session && (
            <Row alignItems="center" gap="4">
              <Avatar seed={sessionId} size={48} />
              <Column>
                <Text weight="bold">{formatMessage(labels.replay)}</Text>
                <Text color="muted">
                  {replay.eventCount} {formatMessage(labels.events).toLowerCase()}
                </Text>
              </Column>
            </Row>
          )}
          <ReplayPlayer events={replay.events} />
          {session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
