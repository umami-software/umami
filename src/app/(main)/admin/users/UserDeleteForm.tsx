import { Button, Column, Row } from '@umami/react-zen';
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
    <Column gap="4">
      <Row gap="1">{t(messages.confirmDelete, { target: username })}</Row>
      <Row alignItems="center" justifyContent="flex-end" gap="3">
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          {t(labels.delete)}
        </Button>
      </Row>
    </Column>
  );
}
