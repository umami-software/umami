import { Button, Icon, Modal, DialogTrigger, Dialog, Text } from '@umami/react-zen';
import { useMessages, useLoginQuery } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { UserDeleteForm } from './UserDeleteForm';

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
  const { user } = useLoginQuery();

  return (
    <DialogTrigger>
      <Button isDisabled={userId === user?.id} data-test="button-delete">
        <Icon size="sm">
          <Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.deleteUser)} style={{ width: 400 }}>
          {({ close }) => (
            <UserDeleteForm userId={userId} username={username} onSave={onDelete} onClose={close} />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
