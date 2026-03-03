'use client';
import { Column, Dialog, Modal, type ModalProps } from '@umami/react-zen';
import { ReplayPlayback } from '@/app/(main)/websites/[websiteId]/replays/[sessionId]/ReplayPlayback';
import { useNavigation } from '@/components/hooks';

export interface ReplayModalProps extends ModalProps {
  websiteId: string;
}

export function ReplayModal({ websiteId, ...props }: ReplayModalProps) {
  const {
    router,
    query: { replay },
    updateParams,
  } = useNavigation();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ replay: undefined }));
    }
  };

  return (
    <Modal
      placement="bottom"
      offset="80px"
      isOpen={!!replay}
      onOpenChange={handleOpenChange}
      isDismissable
      {...props}
    >
      <Column height="100%" maxWidth="1320px" style={{ margin: '0 auto' }}>
        <Dialog variant="sheet">
          {({ close }) => (
            <Column padding="6">
              <ReplayPlayback websiteId={websiteId} sessionId={replay} onClose={close} />
            </Column>
          )}
        </Dialog>
      </Column>
    </Modal>
  );
}
