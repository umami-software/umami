'use client';
import { Button, Column, Dialog, DialogTrigger, Icon, Popover, Row, Text } from '@umami/react-zen';
import { Bookmark, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useMessages,
  useMobile,
  useReplayQuery,
  useReplaySavedQuery,
  useUpdateQuery,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { touch } from '@/components/hooks/useModified';
import { getReplayViewport } from '@/lib/replay';
import { ReplayPlayer } from './ReplayPlayer';
import { ReplaySaveForm } from './ReplaySaveForm';

type ReplayOrientation = 'portrait' | 'landscape';

export function ReplayPlayback({
  websiteId,
  replayId,
  showSessionInfo = true,
  onClose,
  onReplayStateChange,
}: {
  websiteId: string;
  replayId: string;
  showSessionInfo?: boolean;
  onClose?: () => void;
  onReplayStateChange?: (orientation: ReplayOrientation | null) => void;
}) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, replayId);
  const { data: replaySaved } = useReplaySavedQuery(websiteId, replayId);
  const { data: session } = useWebsiteSessionQuery(websiteId, replay?.sessionId);
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const { mutate } = useUpdateQuery(`/websites/${websiteId}/replays/saved/${replayId}`);
  const replayViewport = useMemo(() => getReplayViewport(replay?.events), [replay?.events]);
  const replayOrientation: ReplayOrientation | null = replayViewport
    ? replayViewport.height > replayViewport.width
      ? 'portrait'
      : 'landscape'
    : replay
      ? 'landscape'
      : null;

  const saved = isSaved ?? replaySaved?.isSaved ?? false;

  useEffect(() => {
    onReplayStateChange?.(replayOrientation);
  }, [replayOrientation, onReplayStateChange]);

  const handleUnsave = () => {
    setIsSaved(false);
    mutate({ isSaved: false }, { onSuccess: () => touch('replays') });
  };

  return (
    <LoadingPanel
      data={replay}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      style={{ minHeight: '400px' }}
    >
      {replay && (
        <Column gap="6" width="100%" minWidth="0">
          {session && (
            <Row
              justifyContent="space-between"
              alignItems="flex-start"
              gap="3"
              style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
            >
              <Row alignItems="center" gap="4" minWidth="0" style={{ flex: '1 1 240px' }}>
                <Avatar seed={replay.sessionId} size={48} />
                <Column minWidth="0">
                  <Text weight="bold">{t(labels.replay)}</Text>
                  <Text color="muted">
                    {replay.eventCount} {t(labels.actions).toLowerCase()}
                  </Text>
                </Column>
              </Row>
              <Row gap="2" style={{ flex: '0 0 auto' }}>
                {saved ? (
                  <Button onPress={handleUnsave} variant="quiet">
                    <Icon>
                      <Bookmark fill="currentColor" />
                    </Icon>
                  </Button>
                ) : (
                  <DialogTrigger>
                    <Button variant="quiet">
                      <Icon>
                        <Bookmark fill="none" />
                      </Icon>
                    </Button>
                    <Popover side="bottom" align="end">
                      <Dialog title={t(labels.saveReplay)} style={{ width: '300px' }}>
                        {({ close }) => (
                          <ReplaySaveForm
                            websiteId={websiteId}
                            replayId={replayId}
                            onSave={() => {
                              setIsSaved(true);
                              touch('replays');
                            }}
                            onClose={close}
                          />
                        )}
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                )}
                {onClose && (
                  <Button onPress={onClose} variant="quiet">
                    <Icon>
                      <X />
                    </Icon>
                  </Button>
                )}
              </Row>
            </Row>
          )}
          <ReplayPlayer events={replay.events} />
          {showSessionInfo && session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
