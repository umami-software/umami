import { Button, Icon, Text, Modal, Icons, ModalTrigger, useToasts } from 'react-basics';
import UserAddForm from './UserAddForm';
import useMessages from 'components/hooks/useMessages';
import { setValue } from 'store/cache';

export function UserAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setValue('users', Date.now());
    onSave?.();
  };

  return (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createUser)}>
        {(close: () => void) => <UserAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default UserAddButton;
