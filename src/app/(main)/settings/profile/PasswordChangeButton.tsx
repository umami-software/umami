import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { LockKeyhole } from '@/components/icons';
import { PasswordEditForm } from './PasswordEditForm';

export function PasswordChangeButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();

  const handleSave = () => {
    toast(formatMessage(messages.saved));
  };

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <LockKeyhole />
        </Icon>
        <Text>{formatMessage(labels.changePassword)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.changePassword)} style={{ width: 400 }}>
          {({ close }) => <PasswordEditForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
