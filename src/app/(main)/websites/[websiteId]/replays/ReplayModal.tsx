'use client';
import { Column, Dialog, DialogContent } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { ReplayPlayback } from '@/app/(main)/websites/[websiteId]/replays/[replayId]/ReplayPlayback';
import { useNavigation } from '@/components/hooks';
import { buildPath } from '@/lib/url';
import type { ReplaySource } from '@/store/replays';

export interface ReplayModalProps {
  websiteId: string;
  className?: string;
  replayId?: string;
  replaySource?: ReplaySource;
}

export function ReplayModal({ websiteId, replayId, replaySource, className }: ReplayModalProps) {
  const {
    router,
    query: { replay },
    searchParams,
    updateParams,
  } = useNavigation();
  const activeReplayId = replayId || replay;
  const [replayOrientation, setReplayOrientation] = useState<'portrait' | 'landscape' | null>(null);

  useEffect(() => {
    if (activeReplayId) {
      setReplayOrientation(null);
    }
  }, [activeReplayId]);

  const modalStyle = {
    width:
      replayOrientation === 'portrait'
        ? 'min(calc(100dvw - 48px), 900px)'
        : 'min(calc(100dvw - 48px), 1320px)',
    maxWidth: 'calc(100% - 2rem)',
    height: 'calc(100dvh - 80px)',
    overflowY: 'auto' as const,
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (replayId) {
        const query = Object.fromEntries(searchParams.entries());
        delete query.replay;

        router.push(buildPath(`/websites/${websiteId}/replays`, query));
      } else {
        router.push(updateParams({ replay: undefined }));
      }
    }
  };

  return (
    <Dialog open={!!activeReplayId} onOpenChange={handleOpenChange}>
      <DialogContent className={className} style={modalStyle} showCloseButton={false}>
        <Column padding="6">
          {activeReplayId && (
            <ReplayPlayback
              websiteId={websiteId}
              replayId={activeReplayId}
              replaySource={replaySource}
              onClose={() => handleOpenChange(false)}
              onReplayStateChange={setReplayOrientation}
            />
          )}
        </Column>
      </DialogContent>
    </Dialog>
  );
}
