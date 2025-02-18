import TypeConfirmationForm from '@/components/common/TypeConfirmationForm';
import { useApi, useMessages } from '@/components/hooks';

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
  const { labels, formatMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: () => del(`/teams/${teamId}`),
  });

  const handleConfirm = async () => {
    mutate(null, {
      onSuccess: async () => {
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
      error={error}
      buttonLabel={formatMessage(labels.delete)}
      buttonVariant="danger"
    />
  );
}

export default TeamDeleteForm;
