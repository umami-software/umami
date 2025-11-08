import { useMessages, useUpdateQuery } from '@/components/hooks';
import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm';

const CONFIRM_VALUE = 'RESET';

export function WebsiteResetForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { mutateAsync, isPending, error } = useUpdateQuery(`/websites/${websiteId}/reset`);

  const handleConfirm = async () => {
    await mutateAsync(null, {
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
      buttonLabel={formatMessage(labels.reset)}
    />
  );
}
