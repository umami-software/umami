'use client';
import { Column, Row, Text } from '@umami/react-zen';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useRecordingQuery, useWebsiteSessionQuery } from '@/components/hooks';
import { RecordingPlayer } from './RecordingPlayer';

export function RecordingPlayback({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data: recording, isLoading, error } = useRecordingQuery(websiteId, sessionId);
  const { data: session } = useWebsiteSessionQuery(websiteId, sessionId);
  const { formatMessage, labels } = useMessages();

  return (
    <LoadingPanel
      data={recording}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {recording && (
        <Column gap="6">
          {session && (
            <Row alignItems="center" gap="4">
              <Avatar seed={sessionId} size={48} />
              <Column>
                <Text weight="bold">{formatMessage(labels.recording)}</Text>
                <Text color="muted">
                  {recording.eventCount} {formatMessage(labels.events).toLowerCase()}
                </Text>
              </Column>
            </Row>
          )}
          <RecordingPlayer events={recording.events} />
          {session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
