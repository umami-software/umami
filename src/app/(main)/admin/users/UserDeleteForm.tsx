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
  const { messages, labels, t } = useMessages();
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
      title={t(labels.delete)}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmLabel={t(labels.delete)}
      isDanger
    >
      <Row gap="1">{t(messages.confirmDelete, { target: username })}</Row>
    </AlertDialog>
  );
}
