'use client';
import { Column, Row, Text } from '@umami/react-zen';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useMessages, useReplayQuery, useWebsiteSessionQuery } from '@/components/hooks';
import { ReplayPlayer } from './ReplayPlayer';

export function ReplayPlayback({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, sessionId);
  const { data: session } = useWebsiteSessionQuery(websiteId, sessionId);
  const { t, labels } = useMessages();

  return (
    <Column gap="6" minHeight="800px">
      <LoadingPanel
        data={replay}
        isLoading={isLoading}
        error={error}
        loadingIcon="spinner"
        loadingPlacement="absolute"
      >
        {replay && (
          <>
            <Row alignItems="center" gap="4">
              <Avatar seed={sessionId} size={48} />
              <Column>
                <Text weight="bold">{t(labels.replay)}</Text>
                <Text color="muted">
                  {replay.eventCount} {t(labels.events).toLowerCase()}
                </Text>
              </Column>
            </Row>
            <SessionInfo data={session} />
            <Column paddingY="20">
              <ReplayPlayer events={replay.events} />
            </Column>
          </>
        )}
      </LoadingPanel>
    </Column>
  );
}
