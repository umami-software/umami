import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import UserDeleteForm from './UserDeleteForm';

export function UserDeleteButton({ userId, username, onDelete }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  return (
    <ModalTrigger disabled={userId === user?.id}>
      <Button disabled={userId === user?.id}>
        <Icon>
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal title={formatMessage(labels.deleteUser)}>
        {close => (
          <UserDeleteForm userId={userId} username={username} onSave={onDelete} onClose={close} />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default UserDeleteButton;
