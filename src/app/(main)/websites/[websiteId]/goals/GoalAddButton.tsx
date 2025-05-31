import { Button, DialogTrigger, Dialog, Icon, Text, Modal } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { GoalAddForm } from './GoalAddForm';
import { Plus } from '@/components/icons';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addGoal)}</Text>
      </Button>
      <Modal>
        <Dialog
          variant="modal"
          title={formatMessage(labels.addGoal)}
          style={{ minHeight: 375, minWidth: 400 }}
        >
          {({ close }) => <GoalAddForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
