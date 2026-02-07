import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@umami/react-zen';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';

export function SegmentSaveButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.segment)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.segment)} style={{ width: 800 }}>
          {({ close }) => {
            return <SegmentEditForm websiteId={websiteId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
