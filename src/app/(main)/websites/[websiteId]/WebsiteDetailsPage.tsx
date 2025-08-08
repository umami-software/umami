'use client';
import { Column, Modal, Dialog } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteExpandedView } from './WebsiteExpandedView';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsiteTableView } from './WebsiteTableView';
import { WebsiteControls } from './WebsiteControls';

export function WebsiteDetailsPage({ websiteId }: { websiteId: string }) {
  const {
    router,
    query: { view, compare },
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
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowCompare={true} />
      <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      <Panel>
        <WebsiteChart websiteId={websiteId} compareMode={compare} />
      </Panel>
      <WebsiteTableView websiteId={websiteId} />
      <Modal isOpen={!!view} onOpenChange={handleOpenChange} isDismissable>
        <Dialog style={{ width: '90vw', height: '90vh' }}>
          {({ close }) => {
            return <WebsiteExpandedView websiteId={websiteId} onClose={() => handleClose(close)} />;
          }}
        </Dialog>
      </Modal>
    </Column>
  );
}
