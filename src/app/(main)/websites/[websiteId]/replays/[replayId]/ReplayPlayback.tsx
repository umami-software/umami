'use client';
import {
  Button,
  Column,
  Icon,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Row,
  Text,
} from '@umami/react-zen';
import { Bookmark, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SessionInfo } from '@/app/(main)/websites/[websiteId]/sessions/SessionInfo';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useMessages,
  useMobile,
  useNavigation,
  useReplayQuery,
  useReplaySavedQuery,
  useUpdateQuery,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { touch } from '@/components/hooks/useModified';
import { getReplayViewport } from '@/lib/replay';
import { type ReplaySource, useReplays } from '@/store/replays';
import { ReplayPlayer } from './ReplayPlayer';
import { ReplaySaveForm } from './ReplaySaveForm';

type ReplayOrientation = 'portrait' | 'landscape';

export function ReplayPlayback({
  websiteId,
  replayId,
  showSessionInfo = true,
  replaySource,
  onClose,
  onReplayStateChange,
}: {
  websiteId: string;
  replayId: string;
  showSessionInfo?: boolean;
  replaySource?: ReplaySource;
  onClose?: () => void;
  onReplayStateChange?: (orientation: ReplayOrientation | null) => void;
}) {
  const { data: replay, isLoading, error } = useReplayQuery(websiteId, replayId);
  const { data: replaySaved } = useReplaySavedQuery(websiteId, replayId);
  const { data: session } = useWebsiteSessionQuery(websiteId, replay?.sessionId);
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const { router, updateParams } = useNavigation();
  const [savedState, setSavedState] = useState<{ replayId: string; isSaved: boolean } | null>(null);
  const [showSave, setShowSave] = useState(false);
  const { mutate } = useUpdateQuery(`/websites/${websiteId}/replays/saved/${replayId}`);
  const replays = useReplays(state => state.replays);
  const replayWebsiteId = useReplays(state => state.websiteId);
  const storedReplaySource = useReplays(state => state.source);
  const getReplayId = (r: any) => r.visitId || r.id;

  const navigationReplays =
    replayWebsiteId === websiteId && storedReplaySource === replaySource ? replays : [];
  const currentIndex = navigationReplays.findIndex(r => getReplayId(r) === replayId);
  const prevReplay = currentIndex > 0 ? navigationReplays[currentIndex - 1] : null;
  const nextReplay =
    currentIndex !== -1 && currentIndex < navigationReplays.length - 1
      ? navigationReplays[currentIndex + 1]
      : null;

  const navigateToReplay = (id: string) => {
    router.push(updateParams({ replay: id }));
  };
  const replayViewport = useMemo(() => getReplayViewport(replay?.events), [replay?.events]);
  const replayOrientation: ReplayOrientation | null = replayViewport
    ? replayViewport.height > replayViewport.width
      ? 'portrait'
      : 'landscape'
    : replay
      ? 'landscape'
      : null;

  const saved =
    savedState?.replayId === replayId ? savedState.isSaved : (replaySaved?.isSaved ?? false);

  useEffect(() => {
    onReplayStateChange?.(replayOrientation);
  }, [replayOrientation, onReplayStateChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.isComposing ||
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="listbox"], [role="menu"], [role="slider"]',
        )
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevReplay) {
        e.preventDefault();
        navigateToReplay(getReplayId(prevReplay));
      } else if (e.key === 'ArrowRight' && nextReplay) {
        e.preventDefault();
        navigateToReplay(getReplayId(nextReplay));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevReplay, nextReplay, router, updateParams]);

  const handleUnsave = () => {
    setSavedState({ replayId, isSaved: false });
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
                  <Text color="muted-foreground">
                    {replay.eventCount} {t(labels.actions).toLowerCase()}
                  </Text>
                </Column>
              </Row>
              <Row gap="2" style={{ flex: '0 0 auto' }}>
                <Button
                  aria-label={`${t(labels.previous)} ${t(labels.replay).toLowerCase()}`}
                  variant="ghost"
                  disabled={!prevReplay}
                  onClick={() => prevReplay && navigateToReplay(getReplayId(prevReplay))}
                >
                  <Icon>
                    <ChevronLeft />
                  </Icon>
                </Button>
                <Button
                  aria-label={`${t(labels.continue)} ${t(labels.replay).toLowerCase()}`}
                  variant="ghost"
                  disabled={!nextReplay}
                  onClick={() => nextReplay && navigateToReplay(getReplayId(nextReplay))}
                >
                  <Icon>
                    <ChevronRight />
                  </Icon>
                </Button>
                {saved ? (
                  <Button onClick={handleUnsave} variant="ghost">
                    <Icon>
                      <Bookmark fill="currentColor" />
                    </Icon>
                  </Button>
                ) : (
                  <Popover open={showSave} onOpenChange={setShowSave}>
                    <PopoverTrigger render={<Button variant="ghost" />}>
                      <Icon>
                        <Bookmark fill="none" />
                      </Icon>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" style={{ width: '300px' }}>
                      <PopoverHeader>
                        <PopoverTitle>{t(labels.saveReplay)}</PopoverTitle>
                      </PopoverHeader>
                      <ReplaySaveForm
                        websiteId={websiteId}
                        replayId={replayId}
                        onSave={() => {
                          setSavedState({ replayId, isSaved: true });
                          touch('replays');
                        }}
                        onClose={() => setShowSave(false)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                {onClose && (
                  <Button onClick={onClose} variant="ghost">
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
