import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages, useModified, useNavigation } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { BoardAddForm } from './BoardAddForm';

export function BoardAddButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const { teamId } = useNavigation();

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('boards');
  };

  return (
    <DialogTrigger>
      <Button data-test="button-board-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.addBoard)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.addBoard)} style={{ width: 400 }}>
          {({ close }) => <BoardAddForm teamId={teamId} onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
