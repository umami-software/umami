import { useDeleteQuery, useMessages } from '@/components/hooks';
import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm';

const CONFIRM_VALUE = 'DELETE';

export function WebsiteDeleteForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(`/websites/${websiteId}`);

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('websites');
        touch(`websites:${websiteId}`);
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
