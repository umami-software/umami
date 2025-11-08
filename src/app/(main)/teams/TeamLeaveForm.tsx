import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';

export function TeamLeaveForm({
  teamId,
  userId,
  teamName,
  onSave,
  onClose,
}: {
  teamId: string;
  userId: string;
  teamName: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const { formatMessage, labels, messages, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, error, isPending } = useDeleteQuery(`/teams/${teamId}/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('teams:members');
        onSave();
        onClose();
      },
    });
  };

  return (
    <ConfirmationForm
      buttonLabel={formatMessage(labels.leave)}
      message={
        <FormattedMessage
          {...messages.confirmLeave}
          values={{
            target: <b>{teamName}</b>,
          }}
        />
      }
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
}
