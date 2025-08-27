import { Button, DialogTrigger, Modal, Text, Icon, Dialog } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { CohortEditForm } from './CohortEditForm';

export function CohortAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.cohort)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.cohort)} style={{ width: 800, minHeight: 300 }}>
          {({ close }) => {
            return <CohortEditForm websiteId={websiteId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
