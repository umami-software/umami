'use client';
import { Dialog, DialogContent } from '@umami/react-zen';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import { useNavigation } from '@/components/hooks';
import { useApp } from '@/store/app';

export interface SessionModalProps {
  websiteId: string;
  className?: string;
}

export function SessionModal({ websiteId, className }: SessionModalProps) {
  const {
    router,
    pathname,
    query: { session },
    updateParams,
  } = useNavigation();
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
    <Dialog open={!!session && canViewSession} onOpenChange={handleOpenChange}>
      <DialogContent
        className={className}
        style={{
          width: 'min(calc(100dvw - 48px), 1320px)',
          maxWidth: 'calc(100% - 2rem)',
          height: 'calc(100dvh - 80px)',
          gridTemplateRows: 'minmax(0, 1fr)',
          padding: 0,
          overflow: 'hidden',
        }}
        showCloseButton={false}
      >
        <OverlayScrollArea style={{ height: '100%' }}>
          <SessionProfile
            websiteId={websiteId}
            sessionId={session}
            showReplays={!isSharePage}
            onClose={() => handleOpenChange(false)}
          />
        </OverlayScrollArea>
      </DialogContent>
    </Dialog>
  );
}
