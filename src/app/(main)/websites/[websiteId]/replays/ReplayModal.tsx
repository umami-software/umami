'use client';
import { Column, Dialog, Modal, type ModalProps } from '@umami/react-zen';
import { ReplayPlayback } from '@/app/(main)/websites/[websiteId]/replays/[replayId]/ReplayPlayback';
import { useNavigation } from '@/components/hooks';
import { buildPath } from '@/lib/url';
import styles from './ReplayModal.module.css';

export interface ReplayModalProps extends ModalProps {
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
    <Modal
      {...props}
      placement="bottom"
      offset="80px"
      className={modalClassName}
      isOpen={!!activeReplayId}
      onOpenChange={handleOpenChange}
      isDismissable
    >
      <Column height="100%">
        <Dialog variant="sheet" className={styles.sheet}>
          {({ close }) => (
            <Column padding="6">
              {activeReplayId && (
                <ReplayPlayback websiteId={websiteId} replayId={activeReplayId} onClose={close} />
              )}
            </Column>
          )}
        </Dialog>
      </Column>
    </Modal>
  );
}
