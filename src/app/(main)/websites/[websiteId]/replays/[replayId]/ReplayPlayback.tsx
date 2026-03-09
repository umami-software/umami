'use client';
import { Button, Column, Dialog, DialogTrigger, Icon, Popover, Row, Text } from '@umami/react-zen';
import { Bookmark, X } from 'lucide-react';
import { useState } from 'react';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useMessages,
  useReplayQuery,
  useUpdateQuery,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { touch } from '@/components/hooks/useModified';
import { ReplayPlayer } from './ReplayPlayer';
import { ReplaySaveForm } from './ReplaySaveForm';

export function ReplayPlayback({
  websiteId,
  replayId,
  onClose,
}: {
  websiteId: string;
  replayId: string;
  onClose?: () => void;
}) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, replayId);
  const { data: session } = useWebsiteSessionQuery(websiteId, replay?.sessionId);
  const { t, labels } = useMessages();
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const { mutate } = useUpdateQuery(`/websites/${websiteId}/replays/${replayId}`);

  const saved = isSaved ?? replay?.isSaved ?? false;

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
      loadingPlacement="absolute"
    >
      {replay && (
        <Column gap="6">
          {session && (
            <Row justifyContent="space-between" alignItems="flex-start">
              <Row alignItems="center" gap="4">
                <Avatar seed={replay.sessionId} size={48} />
                <Column>
                  <Text weight="bold">{t(labels.replay)}</Text>
                  <Text color="muted">
                    {replay.eventCount} {t(labels.actions).toLowerCase()}
                  </Text>
                </Column>
              </Row>
              <Row gap="2">
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
                    <Popover placement="bottom end">
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
          {session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
