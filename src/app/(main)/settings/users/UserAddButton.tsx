import {
  Button,
  Icon,
  Text,
  Modal,
  Icons,
  DialogTrigger,
  Dialog,
  useToast,
} from '@umami/react-zen';
import { UserAddForm } from './UserAddForm';
import { useMessages, useModified } from '@/components/hooks';

export function UserAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = () => {
    toast(formatMessage(messages.saved));
    touch('users');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="primary" data-test="button-create-user">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.createUser)}>
          {({ close }) => <UserAddForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
