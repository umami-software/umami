import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';

const CONFIRM_VALUE = 'DISCONNECT';

export function WebsiteGoogleDisconnectForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/websites/${websiteId}/google-auth`);

  return (
    <TypeConfirmationForm
      confirmationValue={CONFIRM_VALUE}
      onConfirm={() => mutateAsync(null, { onSuccess: () => { onSave?.(); onClose?.(); } })}
      onClose={onClose}
      isLoading={isPending}
      error={error}
      buttonLabel={t(labels.disconnect)}
      buttonVariant="danger"
    />
  );
}
