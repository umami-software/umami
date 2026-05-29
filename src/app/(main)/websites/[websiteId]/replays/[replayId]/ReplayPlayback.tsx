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
  useReplaySavedQuery,
  useUpdateQuery,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { touch } from '@/components/hooks/useModified';
import { ReplayPlayer } from './ReplayPlayer';
import { ReplaySaveForm } from './ReplaySaveForm';

const CONSOLE_EVENT_TAG = 'umami.console';

function formatConsoleValue(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getConsoleLogs(events: any[] = []) {
  return events
    .filter(event => event?.data?.tag === CONSOLE_EVENT_TAG)
    .map(event => {
      const args = event.data.payload?.args;

      return {
        timestamp: Number(event.timestamp) || 0,
        level: event.data.payload?.level || 'log',
        message: (Array.isArray(args) ? args : []).map(formatConsoleValue).join(' '),
      };
    });
}

function formatOffset(timestamp: number, startTimestamp: number) {
  const seconds = Math.max(0, Math.floor((timestamp - startTimestamp) / 1000));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function ReplayConsoleLogs({ events }: { events: any[] }) {
  const { t, labels } = useMessages();
  const logs = getConsoleLogs(events);

  if (!logs.length) return null;

  const startTimestamp = events[0]?.timestamp || logs[0].timestamp;

  return (
    <Column gap="2">
      <Row justifyContent="space-between" alignItems="center">
        <Text weight="bold">{t(labels.consoleLevel)}</Text>
        <Text color="muted">{logs.length} entries</Text>
      </Row>
      <Column
        gap="1"
        style={{
          maxHeight: '240px',
          overflow: 'auto',
          border: '1px solid var(--base300)',
          borderRadius: '8px',
          background: 'var(--base75)',
          padding: '8px',
        }}
      >
        {logs.map((log, index) => (
          <Row key={`${log.timestamp}-${index}`} gap="3" alignItems="flex-start">
            <Text color="muted" style={{ minWidth: '40px', fontFamily: 'monospace' }}>
              {formatOffset(log.timestamp, startTimestamp)}
            </Text>
            <Text
              style={{ minWidth: '44px', fontFamily: 'monospace', textTransform: 'uppercase' }}
            >
              {log.level}
            </Text>
            <Text style={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
              {log.message}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

export function ReplayPlayback({
  websiteId,
  replayId,
  showSessionInfo = true,
  onClose,
}: {
  websiteId: string;
  replayId: string;
  showSessionInfo?: boolean;
  onClose?: () => void;
}) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, replayId);
  const { data: replaySaved } = useReplaySavedQuery(websiteId, replayId);
  const { data: session } = useWebsiteSessionQuery(websiteId, replay?.sessionId);
  const { t, labels } = useMessages();
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const { mutate } = useUpdateQuery(`/websites/${websiteId}/replays/saved/${replayId}`);

  const saved = isSaved ?? replaySaved?.isSaved ?? false;

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
          <ReplayConsoleLogs events={replay.events} />
          {showSessionInfo && session && <SessionInfo data={session} />}
        </Column>
      )}
    </LoadingPanel>
  );
}
