import { useMessages, useModified, useNavigation } from '@/components/hooks';
import {
  Button,
  Icon,
  Icons,
  Modal,
  Dialog,
  DialogTrigger,
  Text,
  useToast,
} from '@umami/react-zen';
import { BoardAddForm } from './BoardAddForm';

export function BoardAddButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const { teamId } = useNavigation();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('boards');
  };

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.addBoard)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addBoard)}>
          {({ close }) => <BoardAddForm teamId={teamId} onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
