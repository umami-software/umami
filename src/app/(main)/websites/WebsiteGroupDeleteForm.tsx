import { Button, Column, Row, Text } from '@umami/react-zen';
import { useDeleteQuery, useMessages } from '@/components/hooks';

export function WebsiteGroupDeleteForm({
  groupId,
  groupName,
  hasChildren = false,
  onSave,
  onClose,
}: {
  groupId: string;
  groupName: string;
  hasChildren?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { mutateAsync, error, isPending } = useDeleteQuery(`/website-groups/${groupId}`);

  const handleDelete = async () => {
    await mutateAsync(undefined, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Column gap="4">
      <Text>{t(messages.confirmDelete, { target: groupName })}</Text>
      {hasChildren && <Text color="muted">{t(messages.deleteGroupWarning)}</Text>}
      {error?.message && <Text color="danger">{error.message}</Text>}
      <Row justifyContent="flex-end" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
        )}
        <Button
          variant="danger"
          isDisabled={isPending}
          onPress={handleDelete}
          data-test="button-delete-group"
        >
          {t(labels.delete)}
        </Button>
      </Row>
    </Column>
  );
}
