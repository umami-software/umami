import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { LockKeyhole } from '@/components/icons';
import { PasswordEditForm } from './PasswordEditForm';

export function PasswordChangeButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();

  const handleSave = () => {
    toast(t(messages.saved));
  };

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <LockKeyhole />
        </Icon>
        <Text>{t(labels.changePassword)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.changePassword)} style={{ width: 400 }}>
          {({ close }) => <PasswordEditForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
