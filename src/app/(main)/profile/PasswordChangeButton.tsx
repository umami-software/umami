import { Button, Icon, Text, useToast, DialogTrigger, Dialog, Modal } from '@umami/react-zen';
import { PasswordEditForm } from '@/app/(main)/profile/PasswordEditForm';
import { Icons } from '@/components/icons';
import { useMessages } from '@/components/hooks';

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
          <Icons.Lock />
        </Icon>
        <Text>{formatMessage(labels.changePassword)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.changePassword)}>
          {({ close }) => <PasswordEditForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
