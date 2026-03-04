'use client';
import { Button, Column, Dialog, Icon, Modal, Row } from '@umami/react-zen';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildPath } from '@/lib/url';
import { ReplayPlayback } from './[sessionId]/ReplayPlayback';

export function ReplayModal({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const query = Object.fromEntries(searchParams.entries());
    delete query.session;

    router.push(buildPath(`/websites/${websiteId}/replays`, query));
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
            <Row justifyContent="flex-end">
              <Button onPress={closeModal} variant="quiet">
                <Icon>
                  <X />
                </Icon>
              </Button>
            </Row>
            <ReplayPlayback websiteId={websiteId} sessionId={sessionId} />
          </Column>
        </Dialog>
      </Column>
    </Modal>
  );
}
