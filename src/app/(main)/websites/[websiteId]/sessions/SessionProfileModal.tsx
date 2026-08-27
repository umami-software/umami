'use client';
import { Column, Dialog, Modal } from '@umami/react-zen';
import { useRouter, useSearchParams } from 'next/navigation';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { buildPath } from '@/lib/url';
import styles from './SessionModal.module.css';
import { SessionProfile } from './SessionProfile';

export function SessionProfileModal({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const query = Object.fromEntries(searchParams.entries());
    delete query.session;

    router.replace(buildPath(`/websites/${websiteId}/sessions`, query), { scroll: false });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
    }
  };

  return (
    <ControlledDialog>
      <Modal className={styles.modal} isOpen onOpenChange={handleOpenChange}>
        <Column height="100%">
          <Dialog className="h-full rounded-lg">
            <Column padding="10">
              <SessionProfile websiteId={websiteId} sessionId={sessionId} onClose={closeModal} />
            </Column>
          </Dialog>
        </Column>
      </Modal>
    </ControlledDialog>
  );
}
