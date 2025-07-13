import { AlertDialog, Row } from '@umami/react-zen';
import { useApi, useMessages, useModified } from '@/components/hooks';

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
  const { del, useMutation } = useApi();
  const { mutate } = useMutation({ mutationFn: () => del(`/users/${userId}`) });
  const { touch } = useModified();

  const handleConfirm = async () => {
    mutate(null, {
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
