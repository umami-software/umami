import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';

const CONFIRM_VALUE = 'DELETE';

export function TeamDeleteForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { labels, formatMessage, getErrorMessage } = useMessages();
  const { mutate, error, isPending, touch } = useDeleteQuery(`/teams/${teamId}`);

  const handleConfirm = async () => {
    mutate(null, {
      onSuccess: async () => {
        touch('teams');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <TypeConfirmationForm
      confirmationValue={CONFIRM_VALUE}
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={getErrorMessage(error)}
      buttonLabel={formatMessage(labels.delete)}
      buttonVariant="danger"
    />
  );
}
