import {
  Button,
  Icon,
  Text,
  useToast,
  DialogTrigger,
  Dialog,
  Modal,
  Column,
} from '@umami/react-zen';
import { PasswordEditForm } from './PasswordEditForm';
import { LockKeyhole } from '@/components/icons';
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
          <LockKeyhole />
        </Icon>
        <Text>{formatMessage(labels.changePassword)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.changePassword)}>
          {({ close }) => (
            <Column width="300px">
              <PasswordEditForm onSave={handleSave} onClose={close} />
            </Column>
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
