import { AlertDialog, Row } from '@umami/react-zen';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';

export function UserDeleteForm({
  userId,
  username,
  onSave,
  onClose,
}: {
  userId: string;
  username: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { messages, labels, formatMessage } = useMessages();
  const { mutateAsync } = useDeleteQuery(`/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('users');
        touch(`users:${userId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <AlertDialog
      title={formatMessage(labels.delete)}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmLabel={formatMessage(labels.delete)}
      isDanger
    >
      <Row gap="1">{formatMessage(messages.confirmDelete, { target: username })}</Row>
    </AlertDialog>
  );
}
