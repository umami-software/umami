import { Dialog, Modal, ModalProps } from '@umami/react-zen';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { useNavigation } from '@/components/hooks';

export interface SessionModalProps extends ModalProps {
  websiteId: string;
}

export function SessionModal({ websiteId, ...props }: SessionModalProps) {
  const {
    router,
    query: { session },
    updateParams,
  } = useNavigation();

  const handleClose = (close: () => void) => {
    router.push(updateParams({ session: undefined }));
    close();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ session: undefined }));
    }
  };

  return (
    <Modal isOpen={!!session} onOpenChange={handleOpenChange} isDismissable {...props}>
      <Dialog
        style={{
          maxWidth: 1320,
          width: '100vw',
          minHeight: '300px',
          height: 'calc(100vh - 40px)',
        }}
      >
        {({ close }) => {
          return (
            <SessionProfile
              websiteId={websiteId}
              sessionId={session}
              onClose={() => handleClose(close)}
            />
          );
        }}
      </Dialog>
    </Modal>
  );
}
