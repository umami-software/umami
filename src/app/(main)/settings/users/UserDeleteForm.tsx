import { useToast } from '@umami/react-zen';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';

export function UserDeleteForm({ userId, username, onSave, onClose }) {
  const { messages, labels, formatMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({ mutationFn: () => del(`/users/${userId}`) });
  const { touch } = useModified();
  const { toast } = useToast();

  const handleConfirm = async () => {
    mutate(null, {
      onSuccess: async () => {
        touch('users');
        toast(formatMessage(messages.successMessage));
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <ConfirmationForm
      message={formatMessage(messages.confirmDelete, {
        target: <b key={messages.confirmDelete.id}>&nbsp;{username}</b>,
      })}
      onConfirm={handleConfirm}
      onClose={onClose}
      buttonLabel={formatMessage(labels.delete)}
      buttonVariant="danger"
      isLoading={isPending}
      error={error}
    />
  );
}
