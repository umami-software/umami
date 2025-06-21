import { Button, Icon, Text, Row, DialogTrigger, Dialog, Modal } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useWebsite } from '@/components/hooks/useWebsite';
import { Share, Edit } from '@/components/icons';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteShareForm } from '@/app/(main)/settings/websites/[websiteId]/WebsiteShareForm';
import { useMessages } from '@/components/hooks';

export function WebsiteHeader() {
  const website = useWebsite();

  return (
    <PageHeader title={website.name} icon={<Favicon domain={website.domain} />} showBorder={false}>
      <Row alignItems="center" gap>
        <ActiveUsers websiteId={website.id} />
        <ShareButton websiteId={website.id} shareId={website.shareId} />
        <Button>
          <Icon>
            <Edit />
          </Icon>
          <Text>Edit</Text>
        </Button>
      </Row>
    </PageHeader>
  );
}

const ShareButton = ({ websiteId, shareId }) => {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Share />
        </Icon>
        <Text>Share</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.share)} style={{ width: 600 }}>
          {({ close }) => {
            return <WebsiteShareForm websiteId={websiteId} shareId={shareId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};
