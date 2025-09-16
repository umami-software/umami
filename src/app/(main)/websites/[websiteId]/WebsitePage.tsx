'use client';
import { Column, Modal, Dialog } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteExpandedView } from './WebsiteExpandedView';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsitePanels } from './WebsitePanels';
import { WebsiteControls } from './WebsiteControls';

export function WebsitePage({ websiteId }: { websiteId: string }) {
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
    <Column gap marginLeft="2">
      <WebsiteControls websiteId={websiteId} />
      <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      <Panel minHeight="520px">
        <WebsiteChart websiteId={websiteId} />
      </Panel>
      <WebsitePanels websiteId={websiteId} />
      <Modal isOpen={!!view} onOpenChange={handleOpenChange} isDismissable>
        <Dialog style={{ maxWidth: 1320, width: '100vw', height: 'calc(100vh - 40px)' }}>
          {({ close }) => {
            return <WebsiteExpandedView websiteId={websiteId} onClose={() => handleClose(close)} />;
          }}
        </Dialog>
      </Modal>
    </Column>
  );
}
