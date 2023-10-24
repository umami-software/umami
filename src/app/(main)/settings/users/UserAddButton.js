import { Button, Icon, Text, Modal, Icons, ModalTrigger } from 'react-basics';
import UserAddForm from './UserAddForm';
import useMessages from 'components/hooks/useMessages';

export function UserAddButton({ onSave }) {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {
    onSave();
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
        {close => <UserAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default UserAddButton;
