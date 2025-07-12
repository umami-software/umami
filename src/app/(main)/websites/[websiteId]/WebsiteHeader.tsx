import { Button, Icon, Text, Row, DialogTrigger, Dialog, Modal } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useWebsite } from '@/components/hooks/useWebsite';
import { Share, Edit } from '@/components/icons';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteShareForm } from '@/app/(main)/settings/websites/[websiteId]/WebsiteShareForm';
import { useMessages, useNavigation } from '@/components/hooks';
import { LinkButton } from '@/components/common/LinkButton';

export function WebsiteHeader() {
  const website = useWebsite();
  const { renderUrl } = useNavigation();

  return (
    <PageHeader title={website.name} icon={<Favicon domain={website.domain} />} showBorder={false}>
      <Row alignItems="center" gap="6">
        <ActiveUsers websiteId={website.id} />
        <Row alignItems="center" gap>
          <ShareButton websiteId={website.id} shareId={website.shareId} />
          <LinkButton href={renderUrl(`/settings/websites/${website.id}`)}>
            <Icon>
              <Edit />
            </Icon>
            <Text>Edit</Text>
          </LinkButton>
        </Row>
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
        <Dialog title={formatMessage(labels.share)} style={{ width: 400 }}>
          {({ close }) => {
            return <WebsiteShareForm websiteId={websiteId} shareId={shareId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};
