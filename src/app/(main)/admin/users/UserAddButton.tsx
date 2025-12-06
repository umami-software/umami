import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { UserAddForm } from './UserAddForm';

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
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.createUser)} style={{ width: 400 }}>
          {({ close }) => <UserAddForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
