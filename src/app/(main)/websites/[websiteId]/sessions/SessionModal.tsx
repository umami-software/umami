'use client';
import { Column, Dialog, Sheet, type SheetProps } from '@umami/react-zen';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useNavigation } from '@/components/hooks';
import styles from './SessionModal.module.css';

export interface SessionModalProps extends SheetProps {
  websiteId: string;
}

export function SessionModal({ websiteId, className, ...props }: SessionModalProps) {
  const {
    router,
    pathname,
    query: { session },
    updateParams,
  } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.replace(updateParams({ session: undefined }), { scroll: false });
    }
  };

  return (
    <ControlledDialog>
      <Sheet
        side="bottom"
        size="calc(100dvh - 80px)"
        className={[styles.modal, className].filter(Boolean).join(' ')}
        isOpen={!!session}
        onOpenChange={handleOpenChange}
        {...props}
      >
        <Column height="100%">
          <Dialog className="rounded-lg">
            {({ close }) => (
              <Column padding="10">
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
      </Sheet>
    </ControlledDialog>
  );
}
