import { useApi, useMessages } from '@/components/hooks';
import TypeConfirmationForm from '@/components/common/TypeConfirmationForm';

export function WebsiteDeleteForm({
  websiteId,
  CONFIRM_VALUE,
  onSave,
  onClose,
}: {
  websiteId: string | string[];
  CONFIRM_VALUE: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (typeof websiteId === 'string') {
        return del(`/websites/${websiteId}`);
      } else {
        const ids = Array.isArray(websiteId) ? websiteId : [websiteId];
        return Promise.all(ids.map(id => del(`/websites/${id}`)));
      }
    },
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
