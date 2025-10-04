'use client';
import { PageBody } from '@/components/common/PageBody';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { LinkPanels } from '@/app/(main)/links/[linkId]/LinkPanels';
import { Column, Dialog, Grid, Modal } from '@umami/react-zen';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { useNavigation } from '@/components/hooks';

const excludedIds = ['path', 'entry', 'exit', 'title', 'language', 'screen', 'event'];

export function LinkPage({ linkId }: { linkId: string }) {
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
    <LinkProvider linkId={linkId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <LinkHeader />
            <LinkControls linkId={linkId} />
            <LinkMetricsBar linkId={linkId} showChange={true} />
            <Panel>
              <WebsiteChart websiteId={linkId} />
            </Panel>
            <LinkPanels linkId={linkId} />
          </PageBody>
          <Modal isOpen={!!view} onOpenChange={handleOpenChange} isDismissable>
            <Dialog style={{ maxWidth: 1320, width: '100vw', height: 'calc(100vh - 40px)' }}>
              {({ close }) => {
                return (
                  <WebsiteExpandedView
                    websiteId={linkId}
                    excludedIds={excludedIds}
                    onClose={() => handleClose(close)}
                  />
                );
              }}
            </Dialog>
          </Modal>
        </Column>
      </Grid>
    </LinkProvider>
  );
}
