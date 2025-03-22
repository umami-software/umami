import { Button, Icon, Icons, Modal, DialogTrigger, Dialog, Text } from '@umami/react-zen';
import { useMessages, useLoginQuery } from '@/components/hooks';
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
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.deleteUser)}>
          {({ close }) => (
            <UserDeleteForm userId={userId} username={username} onSave={onDelete} onClose={close} />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
