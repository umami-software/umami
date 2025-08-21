import { Button, Icon, Text, Row, DialogTrigger, Dialog, Modal } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Share, Edit } from '@/components/icons';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteShareForm } from '@/app/(main)/websites/[websiteId]/settings/WebsiteShareForm';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { LinkButton } from '@/components/common/LinkButton';

export function WebsiteHeader() {
  const website = useWebsite();
  const { renderUrl, pathname } = useNavigation();
  const isSettings = pathname.endsWith('/settings');

  if (isSettings) {
    return null;
  }

  return (
    <PageHeader title={website.name} icon={<Favicon domain={website.domain} />} marginBottom="3">
      <Row alignItems="center" gap="6">
        <ActiveUsers websiteId={website.id} />
        <Row alignItems="center" gap>
          <ShareButton websiteId={website.id} shareId={website.shareId} />
          <LinkButton href={renderUrl(`/websites/${website.id}/settings`, false)}>
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
        <Dialog title={formatMessage(labels.share)} style={{ width: 600 }}>
          {({ close }) => {
            return <WebsiteShareForm websiteId={websiteId} shareId={shareId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};
