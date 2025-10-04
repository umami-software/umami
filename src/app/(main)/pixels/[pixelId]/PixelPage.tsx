'use client';
import { PageBody } from '@/components/common/PageBody';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { PixelPanels } from '@/app/(main)/pixels/[pixelId]/PixelPanels';
import { Column, Dialog, Grid, Modal } from '@umami/react-zen';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { useNavigation } from '@/components/hooks';

const excludedIds = ['path', 'entry', 'exit', 'title', 'language', 'screen', 'event'];

export function PixelPage({ pixelId }: { pixelId: string }) {
  const {
    router,
    query: { view },
    updateParams,
  } = useNavigation();

  const handleClose = (close: () => void) => {
    router.push(updateParams({ view: undefined }));
    close();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ view: undefined }));
    }
  };

  return (
    <PixelProvider pixelId={pixelId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <PixelHeader />
            <PixelControls pixelId={pixelId} />
            <PixelMetricsBar pixelId={pixelId} showChange={true} />
            <Panel>
              <WebsiteChart websiteId={pixelId} />
            </Panel>
            <PixelPanels pixelId={pixelId} />
          </PageBody>
          <Modal isOpen={!!view} onOpenChange={handleOpenChange} isDismissable>
            <Dialog style={{ maxWidth: 1320, width: '100vw', height: 'calc(100vh - 40px)' }}>
              {({ close }) => {
                return (
                  <WebsiteExpandedView
                    websiteId={pixelId}
                    excludedIds={excludedIds}
                    onClose={() => handleClose(close)}
                  />
                );
              }}
            </Dialog>
          </Modal>
        </Column>
      </Grid>
    </PixelProvider>
  );
}
