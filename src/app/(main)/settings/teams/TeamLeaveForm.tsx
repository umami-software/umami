import { useApi, useMessages, useModified } from 'components/hooks';
import ConfirmationForm from 'components/common/ConfirmationForm';

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
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: () => del(`/teams/${teamId}/users/${userId}`),
  });
  const { touch } = useModified();

  const handleConfirm = async () => {
    mutate(null, {
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
        <FormattedMessage {...messages.confirmLeave} values={{ target: <b>{teamName}</b> }} />
      }
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={error}
    />
  );
}

export default TeamLeaveForm;
