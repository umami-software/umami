'use client';
import { Column, Dialog, DialogContent } from '@umami/react-zen';
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

    router.replace(buildPath(`/websites/${websiteId}/sessions`, query), { scroll: false });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        style={{
          width: 'min(calc(100dvw - 48px), 1320px)',
          maxWidth: 'calc(100% - 2rem)',
          height: 'calc(100dvh - 80px)',
          overflowY: 'auto',
        }}
        showCloseButton={false}
      >
        <Column padding="10">
          <SessionProfile websiteId={websiteId} sessionId={sessionId} onClose={closeModal} />
        </Column>
      </DialogContent>
    </Dialog>
  );
}
