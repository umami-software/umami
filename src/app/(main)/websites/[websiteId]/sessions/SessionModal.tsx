'use client';
import { Column, Dialog, Modal, type ModalProps } from '@umami/react-zen';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useMobile, useNavigation } from '@/components/hooks';
import { useApp } from '@/store/app';
import styles from './SessionModal.module.css';

export interface SessionModalProps extends ModalProps {
  websiteId: string;
}

export function SessionModal({ websiteId, className, ...props }: SessionModalProps) {
  const {
    router,
    pathname,
    query: { session },
    updateParams,
  } = useNavigation();
  const { isMobile } = useMobile();
  const isSharePage = pathname.includes('/share/');
  const shareParameters = useApp((state: any) => state.share?.parameters);
  // Session detail is only served to shares that include the Sessions section.
  const hasSectionParameters = Object.entries(shareParameters ?? {}).some(
    ([key, value]) => key !== 'allowFilter' && typeof value === 'boolean',
  );
  const canViewSession = !hasSectionParameters || shareParameters?.sessions === true;
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.replace(updateParams({ session: undefined }), { scroll: false });
    }
  };

  return (
    <ControlledDialog>
      <Modal
        className={[styles.modal, className].filter(Boolean).join(' ')}
        isOpen={!!session && canViewSession}
        onOpenChange={handleOpenChange}
        {...props}
      >
        <Column height="100%">
          <Dialog className="h-full rounded-lg">
            {({ close }) => (
              <Column padding={isMobile ? '6' : '10'} minWidth="0" width="100%">
                <SessionProfile
                  websiteId={websiteId}
                  sessionId={session}
                  showReplays={!isSharePage}
                  onClose={() => close()}
                />
              </Column>
            )}
          </Dialog>
        </Column>
      </Modal>
    </ControlledDialog>
  );
}
