'use client';
import { Column, Dialog, Modal, type ModalProps } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { ReplayPlayback } from '@/app/(main)/websites/[websiteId]/replays/[replayId]/ReplayPlayback';
import { ControlledDialog } from '@/components/common/ControlledDialog';
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
  const [replayOrientation, setReplayOrientation] = useState<'portrait' | 'landscape' | null>(null);

  useEffect(() => {
    if (activeReplayId) {
      setReplayOrientation(null);
    }
  }, [activeReplayId]);

  const modalClassName = [
    styles.modal,
    replayOrientation === 'portrait' ? styles.portrait : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

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
    <ControlledDialog>
      <Modal
        {...props}
        className={modalClassName}
        isOpen={!!activeReplayId}
        onOpenChange={handleOpenChange}
      >
        <Column height="100%">
          <Dialog className="h-full rounded-lg">
            {({ close }) => (
              <Column padding="6">
                {activeReplayId && (
                  <ReplayPlayback
                    websiteId={websiteId}
                    replayId={activeReplayId}
                    onClose={close}
                    onReplayStateChange={setReplayOrientation}
                  />
                )}
              </Column>
            )}
          </Dialog>
        </Column>
      </Modal>
    </ControlledDialog>
  );
}
