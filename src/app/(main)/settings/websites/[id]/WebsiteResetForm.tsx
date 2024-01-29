import { useApi, useMessages } from 'components/hooks';
import TypeConfirmationForm from 'components/common/TypeConfirmationForm';

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
  const { post, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}/reset`, data),
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
      buttonLabel={formatMessage(labels.reset)}
    />
  );
}

export default WebsiteResetForm;
