'use client';
import { Column, Dialog, Modal, type ModalProps } from '@umami/react-zen';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { useNavigation } from '@/components/hooks';

export interface SessionModalProps extends ModalProps {
  websiteId: string;
}

export function SessionModal({ websiteId, ...props }: SessionModalProps) {
  const {
    router,
    pathname,
    query: { session },
    updateParams,
  } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ session: undefined }));
    }
  };

  return (
    <Modal
      placement="bottom"
      offset="80px"
      isOpen={!!session}
      onOpenChange={handleOpenChange}
      isDismissable
      {...props}
    >
      <Column height="100%" maxWidth="1320px" style={{ margin: '0 auto' }}>
        <Dialog variant="sheet" className="rounded-lg">
          {({ close }) => (
            <Column padding="10">
              <SessionProfile websiteId={websiteId} sessionId={session} showReplays={!isSharePage} allowDelete={!isSharePage} onClose={() => close()} />
            </Column>
          )}
        </Dialog>
      </Column>
    </Modal>
  );
}
