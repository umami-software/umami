import { useApi, useMessages } from '@/components/hooks';
import TypeConfirmationForm from '@/components/common/TypeConfirmationForm';

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
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => del(`/websites/${websiteId}`),
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

export default WebsiteDeleteForm;
