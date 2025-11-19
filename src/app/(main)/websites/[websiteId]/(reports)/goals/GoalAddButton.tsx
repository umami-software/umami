import { Button, DialogTrigger, Dialog, Icon, Text, Modal } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { GoalEditForm } from './GoalEditForm';
import { Plus } from '@/components/icons';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.goal)}</Text>
      </Button>
      <Modal>
        <Dialog
          aria-label="add goal"
          title={formatMessage(labels.goal)}
          style={{ minWidth: 400, minHeight: 300 }}
        >
          {({ close }) => <GoalEditForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
