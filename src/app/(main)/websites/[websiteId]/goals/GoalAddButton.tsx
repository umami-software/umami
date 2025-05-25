import { Button, MenuTrigger, Dialog, Icon, Text, Modal } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { GoalAddForm } from './GoalAddForm';
import { Icons } from '@/components/icons';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <MenuTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.addGoal)}</Text>
      </Button>
      <Modal>
        <Dialog variant="modal" title={formatMessage(labels.addGoal)}>
          {({ close }) => <GoalAddForm websiteId={websiteId} onClose={close} />}
        </Dialog>
      </Modal>
    </MenuTrigger>
  );
}
