import { Button, DialogTrigger, Dialog, Icon, Text, Modal } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { FunnelEditForm } from './FunnelEditForm';
import { Plus } from '@/components/icons';

export function FunnelAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.funnel)}</Text>
      </Button>
      <Modal>
        <Dialog
          variant="modal"
          title={formatMessage(labels.funnel)}
          style={{ minHeight: 375, minWidth: 600 }}
        >
          {({ close }) => <FunnelEditForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
