import { Dialog, Modal } from '@umami/react-zen';
import { useEffect } from 'react';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { WebsiteSearchTermsExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteSearchTermsExpandedView';
import { useGoogleDomain, useMobile, useNavigation } from '@/components/hooks';

export function ExpandedViewModal({
  websiteId,
  excludedIds,
}: {
  websiteId: string;
  excludedIds?: Array<string>;
}) {
  const {
    router,
    query: { view },
    updateParams,
  } = useNavigation();
  const { isMobile } = useMobile();
  const googleDomain = useGoogleDomain();

  const handleClose = (close: () => void) => {
    router.push(updateParams({ view: undefined }));
    close();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ view: undefined }));
    }
  };

  useEffect(() => {
    if (view === 'searchTerms' && !googleDomain) {
      router.replace(updateParams({ view: undefined }));
    }
  }, [view, googleDomain, router, updateParams]);

  if (view === 'searchTerms' && !googleDomain) {
    return null;
  }

  return (
    <Modal isOpen={!!view} onOpenChange={handleOpenChange} isDismissable>
      <Dialog
        style={{
          maxWidth: 1320,
          width: '100vw',
          height: isMobile ? '100dvh' : 'calc(100dvh - 40px)',
          overflow: 'hidden',
        }}
      >
        {({ close }) => {
          if (view === 'searchTerms' && googleDomain) {
            return (
              <WebsiteSearchTermsExpandedView
                websiteId={websiteId}
                googleDomain={googleDomain}
                onClose={() => handleClose(close)}
              />
            );
          }
          return (
            <WebsiteExpandedView
              websiteId={websiteId}
              excludedIds={excludedIds}
              onClose={() => handleClose(close)}
            />
          );
        }}
      </Dialog>
    </Modal>
  );
}
