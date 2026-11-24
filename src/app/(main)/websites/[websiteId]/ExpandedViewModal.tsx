import { Dialog, DialogContent } from '@umami/react-zen';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { useMobile, useNavigation } from '@/components/hooks';
import styles from './ExpandedViewModal.module.css';

export function ExpandedViewModal({
  websiteId,
  excludedIds,
}: {
  websiteId: string;
  excludedIds?: string[];
}) {
  const {
    router,
    query: { view },
    updateParams,
  } = useNavigation();
  const { isMobile } = useMobile();

  const handleClose = () => {
    router.push(updateParams({ view: undefined }));
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={!!view} onOpenChange={handleOpenChange}>
      <DialogContent
        className={styles.dialog}
        showCloseButton={false}
        style={{
          display: 'flex',
          maxWidth: 1320,
          width: '100vw',
          height: isMobile ? '100dvh' : undefined,
          maxHeight: isMobile ? undefined : 'calc(100dvh - 40px)',
          overflow: 'hidden',
        }}
      >
        <WebsiteExpandedView
          websiteId={websiteId}
          excludedIds={excludedIds}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
