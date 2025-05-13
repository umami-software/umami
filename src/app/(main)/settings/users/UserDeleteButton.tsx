import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import { useMessages, useLogin } from '@/components/hooks';
import UserDeleteForm from './UserDeleteForm';

export function UserDeleteButton({
  userId,
  username,
  onDelete,
}: {
  userId: string;
  username: string;
  onDelete?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();

  return (
    <ModalTrigger disabled={userId === user?.id}>
      <Button data-test="button-delete" disabled={userId === user?.id} variant="quiet">
        <Icon>
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal title={formatMessage(labels.deleteUser)}>
        {(close: () => void) => (
          <UserDeleteForm userId={userId} username={username} onSave={onDelete} onClose={close} />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default UserDeleteButton;
