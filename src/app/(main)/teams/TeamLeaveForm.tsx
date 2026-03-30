import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';

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
  const { t, labels, messages, getErrorMessage } = useMessages();
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
      buttonLabel={t(labels.leave)}
      message={t.rich(messages.confirmLeave, {
        target: teamName,
        b: chunks => <b>{chunks}</b>,
      })}
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
}
