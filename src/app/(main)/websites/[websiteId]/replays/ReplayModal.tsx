'use client';
import { Column, Dialog, Sheet, type SheetProps } from '@umami/react-zen';
import { ReplayPlayback } from '@/app/(main)/websites/[websiteId]/replays/[replayId]/ReplayPlayback';
import { useNavigation } from '@/components/hooks';
import { buildPath } from '@/lib/url';
import styles from './ReplayModal.module.css';

export interface ReplayModalProps extends SheetProps {
  websiteId: string;
  replayId?: string;
}

export function ReplayModal({ websiteId, replayId, className, ...props }: ReplayModalProps) {
  const {
    router,
    query: { replay },
    searchParams,
    updateParams,
  } = useNavigation();
  const activeReplayId = replayId || replay;
  const modalClassName = [styles.modal, className].filter(Boolean).join(' ');

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
    <Sheet
      {...props}
      side="bottom"
      size="calc(100dvh - 80px)"
      className={modalClassName}
      isOpen={!!activeReplayId}
      onOpenChange={handleOpenChange}
    >
      <Column height="100%">
        <Dialog className={styles.sheet}>
          {({ close }) => (
            <Column padding="6">
              {activeReplayId && (
                <ReplayPlayback websiteId={websiteId} replayId={activeReplayId} onClose={close} />
              )}
            </Column>
          )}
        </Dialog>
      </Column>
    </Sheet>
  );
}
