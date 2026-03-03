'use client';
import { Button, Column, Icon, Row, Text } from '@umami/react-zen';
import { X } from 'lucide-react';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useReplayQuery, useWebsiteSessionQuery } from '@/components/hooks';
import { ReplayPlayer } from './ReplayPlayer';

export function ReplayPlayback({
  websiteId,
  sessionId,
  onClose,
}: {
  websiteId: string;
  sessionId: string;
  onClose?: () => void;
}) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, sessionId);
  const { data: session } = useWebsiteSessionQuery(websiteId, sessionId);
  const { t, labels } = useMessages();

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
            <Row justifyContent="space-between" alignItems="flex-start">
              <Row alignItems="center" gap="4">
                <Avatar seed={sessionId} size={48} />
                <Column>
                  <Text weight="bold">{t(labels.replay)}</Text>
                  <Text color="muted">
                    {replay.eventCount} {t(labels.actions).toLowerCase()}
                  </Text>
                </Column>
              </Row>
              {onClose && (
                <Button onPress={onClose} variant="quiet">
                  <Icon>
                    <X />
                  </Icon>
                </Button>
              )}
            </Row>
          )}
          <ReplayPlayer events={replay.events} />
          {session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
