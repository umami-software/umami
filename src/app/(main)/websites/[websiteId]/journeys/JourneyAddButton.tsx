import { Button, DialogTrigger, Dialog, Icon, Text, Modal } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { JourneyEditForm } from './JourneyEditForm';
import { Plus } from '@/components/icons';

export function JourneyAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.journey)}</Text>
      </Button>
      <Modal>
        <Dialog
          variant="modal"
          title={formatMessage(labels.journey)}
          style={{ minHeight: 375, minWidth: 400 }}
        >
          {({ close }) => <JourneyEditForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
