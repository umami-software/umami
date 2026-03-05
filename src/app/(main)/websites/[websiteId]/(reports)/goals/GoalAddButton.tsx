import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { GoalEditForm } from './GoalEditForm';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.goal)}</Text>
      </Button>
      <Modal>
        <Dialog
          aria-label="add goal"
          title={t(labels.goal)}
          style={{ minWidth: 400, minHeight: 300 }}
        >
          {({ close }) => <GoalEditForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
