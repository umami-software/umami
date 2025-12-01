import { Button, DialogTrigger, Modal, Text, Icon, Dialog } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';

export function SegmentSaveButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.segment)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.segment)} style={{ width: 800 }}>
          {({ close }) => {
            return <SegmentEditForm websiteId={websiteId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
