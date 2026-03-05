'use client';
import { Column, Dialog, Modal } from '@umami/react-zen';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildPath } from '@/lib/url';
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

    router.push(buildPath(`/websites/${websiteId}/sessions`, query));
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
    }
  };

  return (
    <Modal placement="bottom" offset="80px" isOpen onOpenChange={handleOpenChange} isDismissable>
      <Column height="100%" maxWidth="1320px" style={{ margin: '0 auto' }}>
        <Dialog variant="sheet" className="rounded-lg">
          <Column padding="10">
            <SessionProfile websiteId={websiteId} sessionId={sessionId} onClose={closeModal} />
          </Column>
        </Dialog>
      </Column>
    </Modal>
  );
}
